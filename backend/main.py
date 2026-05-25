import os
import json
import asyncio
import re
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from bs4 import BeautifulSoup

from a11y_engine import A11yEngine
from ai_remediator import AIRemediator, GEMINI_KEY
from cache_manager import CacheManager

app = FastAPI(title="A11y-Agent Core Service")

# Allow CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
engine = A11yEngine()
remediator = AIRemediator()
cache = CacheManager()

# Memory database for tracking files and state in this session
SESSION_FILES: Dict[str, str] = {} # filename -> raw content
WORKSPACE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DUMMY_DIR = os.path.join(os.path.dirname(__file__), "..", "dummy_web_project")

class HTMLPayload(BaseModel):
    filename: str
    html: str

class PatchItem(BaseModel):
    id: str
    selector: str
    type: str
    attribute_value: str

class PatchPayload(BaseModel):
    filename: str
    patches: List[PatchItem]

def crawl_workspace(root_dir: str) -> List[Dict[str, str]]:
    """
    Crawls the workspace root for HTML and React JSX/TSX files, ignoring package files and builds.
    """
    scanned_files = []
    ignore_dirs = {
        "node_modules", "dist", "build", ".git", "__pycache__", 
        ".gemini", "brain", "venv", ".venv", "env", ".env"
    }
    for root, dirs, files in os.walk(root_dir):
        # Prevent traversing ignored dirs in-place
        dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith(".")]
        for file in files:
            if file.endswith((".tsx", ".jsx", ".html")):
                rel_path = os.path.relpath(os.path.join(root, file), root_dir)
                abs_path = os.path.join(root, file)
                try:
                    with open(abs_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    scanned_files.append({
                        "filename": rel_path,
                        "html": content,
                        "abs_path": abs_path
                    })
                except Exception as e:
                    print(f"[WorkspaceCrawler] Error reading {abs_path}: {e}")
    return scanned_files

def apply_precision_patch(source_code: str, original_tag: str, attributes_to_add: str, filename: str = "", selector: str = "") -> str:
    """
    Safely injects attributes into an opening tag in React JSX or HTML,
    matching by structural similarity to preserve variables, types, and imports.
    For JSX/TSX files, it uses the high-fidelity TypeScript AST Parser.
    For HTML, it falls back to structural regex/BeautifulSoup matching.
    """
    import subprocess
    is_jsx = filename.endswith((".tsx", ".jsx"))
    
    if is_jsx:
        try:
            payload = {
                "source_code": source_code,
                "original_tag": original_tag,
                "attributes_to_add": attributes_to_add,
                "selector": selector
            }
            parser_path = os.path.join(os.path.dirname(__file__), "ast_parser.js")
            process = subprocess.run(
                ["node", parser_path],
                input=json.dumps(payload),
                capture_output=True,
                text=True,
                encoding="utf-8",
                check=True
            )
            res = json.loads(process.stdout)
            if res.get("success") and res.get("patched_code"):
                return res["patched_code"]
            else:
                print(f"[AST Patcher Fallback] AST parser returned error: {res.get('error')}. Using regex fallback.")
        except Exception as e:
            print(f"[AST Patcher Fallback] Exception while running AST parser: {e}. Using regex fallback.")

    is_html = filename.endswith(".html")
    if is_html:
        try:
            soup = BeautifulSoup(source_code, "html.parser")
            node = None
            if selector:
                node = soup.select_one(selector)
            if not node:
                tag_name_match = re.match(r'^<([a-zA-Z0-9:-]+)', original_tag)
                if tag_name_match:
                    name = tag_name_match.group(1)
                    candidates = soup.find_all(name)
                    for cand in candidates:
                        if original_tag in str(cand) or str(cand) in original_tag:
                            node = cand
                            break
            if node:
                import shlex
                try:
                    for item in shlex.split(attributes_to_add):
                        if "=" in item:
                            k, v = item.split("=", 1)
                            node[k] = v
                except Exception:
                    matches = re.findall(r'([a-zA-Z0-9_:-]+)=["\'](.*?)["\']', attributes_to_add)
                    for k, v in matches:
                        node[k] = v
                return str(soup)
        except Exception as e:
            print(f"[HTML BeautifulSoup Patcher Fallback] Exception: {e}")

    # 1. Extract tag name
    tag_name_match = re.match(r'^<([a-zA-Z0-9:-]+)', original_tag)
    if not tag_name_match:
        return source_code
    name = tag_name_match.group(1)
    
    # 2. Extract identifying attributes from original tag (BeautifulSoup output, lowercase keys)
    classes = []
    class_matches = re.findall(r'(?:class|className|classname)\s*=\s*["\'](.*?)["\']', original_tag, re.IGNORECASE)
    for c_str in class_matches:
        classes.extend(c_str.split())
        
    id_vals = re.findall(r'\bid\s*=\s*["\'](.*?)["\']', original_tag, re.IGNORECASE)
    
    # Check if original has click, tap, press triggers
    orig_has_click = any(re.search(rf'\b{attr}\b', original_tag.lower()) for attr in ["click", "tap", "press"])
    
    # Extract src or href from original
    orig_src_href = re.findall(r'\b(?:src|href)\s*=\s*["\'](.*?)["\']', original_tag, re.IGNORECASE)
    
    matches = list(re.finditer(rf'<{name}\b', source_code))
    if not matches:
        return source_code
        
    best_match = None
    best_score = -1000  # Start lower to accommodate potential negative scoring
    
    for m in matches:
        start_idx = m.start()
        depth = 0
        end_idx = -1
        in_quotes = False
        quote_char = ""
        for i in range(start_idx, len(source_code)):
            char = source_code[i]
            if char in ('"', "'", "`") and source_code[i-1] != '\\':
                if not in_quotes:
                    in_quotes = True
                    quote_char = char
                elif quote_char == char:
                    in_quotes = False
            if not in_quotes:
                if char == '<':
                    depth += 1
                elif char == '>':
                    depth -= 1
                    if depth == 0:
                        end_idx = i + 1
                        break
        
        if end_idx == -1:
            continue
            
        candidate_tag = source_code[start_idx:end_idx]
        
        # --- Advanced Structural Scoring Algorithm ---
        score = 0
        
        # Click handler matching (CRITICAL: prevents matching div buttons with layout containers!)
        cand_has_click = any(re.search(rf'\b{attr}\b', candidate_tag.lower()) for attr in ["click", "tap", "press", "onclick"])
        if orig_has_click == cand_has_click:
            score += 300
        else:
            score -= 200
            
        # Class names structural matching
        cand_classes = []
        cand_class_matches = re.findall(r'(?:class|className|classname)\s*=\s*(?:["\'](.*?)["\']|\{(.*?)\})', candidate_tag, re.IGNORECASE)
        for matches_tuple in cand_class_matches:
            c_val = matches_tuple[0] or matches_tuple[1] or ""
            cand_classes.extend(c_val.split())
            
        common_classes = set(classes).intersection(set(cand_classes))
        score += len(common_classes) * 50
        
        # ID matching
        cand_id_vals = re.findall(r'\bid\s*=\s*(?:["\'](.*?)["\']|\{(.*?)\})', candidate_tag, re.IGNORECASE)
        for matches_tuple in cand_id_vals:
            id_v = matches_tuple[0] or matches_tuple[1] or ""
            if id_v in id_vals:
                score += 500
                
        # Src/Href matching
        cand_src_href = re.findall(r'\b(?:src|href)\s*=\s*(?:["\'](.*?)["\']|\{(.*?)\})', candidate_tag, re.IGNORECASE)
        for matches_tuple in cand_src_href:
            sh_v = matches_tuple[0] or matches_tuple[1] or ""
            if sh_v in orig_src_href:
                score += 300
                
        if score > best_score:
            best_score = score
            best_match = (start_idx, end_idx, candidate_tag)
            
    if not best_match or best_score < 0:
        return source_code
        
    start_idx, end_idx, matched_tag = best_match
    
    if matched_tag.endswith('/>'):
        closing_slice = '/>'
        base_tag = matched_tag[:-2].rstrip()
    else:
        closing_slice = '>'
        base_tag = matched_tag[:-1].rstrip()
        
    # Split injection variables safely, ensuring quotes are preserved
    new_attrs = []
    # If the attribute to add already exists in the base tag, do not inject it
    # We split standard custom additions: e.g. role="button" tabIndex={0} onKeyDown={...}
    # To split them safely while preserving nested brackets/quotes, we can use a custom parser
    parts = re.findall(r'[a-zA-Z0-9_:-]+=(?:\{.*?\}|"[^"]*"|\'[^\']*\')', attributes_to_add)
    if not parts:
        parts = [attributes_to_add]
        
    for part in parts:
        attr_name = part.split('=')[0] if '=' in part else part
        # Avoid double-injecting existing props
        if attr_name not in base_tag:
            new_attrs.append(part)
            
    if not new_attrs:
        return source_code
        
    patched_tag = f"{base_tag} {' '.join(new_attrs)}{closing_slice}"
    return source_code[:start_idx] + patched_tag + source_code[end_idx:]

@app.get("/api/status")
async def get_status():
    return {
        "status": "active",
        "gemini_active": remediator.api_active,
        "environment": "Development Studio",
        "has_api_key": bool(GEMINI_KEY)
    }

@app.post("/api/scan")
async def scan_files(payloads: List[HTMLPayload]):
    """
    Ingests payloads, audits them, calls AI for fixes, and generates a preview.
    """
    results = []
    for payload in payloads:
        filename = payload.filename
        html_content = payload.html
        SESSION_FILES[filename] = html_content
        
        violations = engine.scan_html(html_content, filename)
        
        async def process_violation(v):
            v_type = v["type"]
            v_html = v["html"]
            v_ctx = v["context"]
            v_meta = v["meta"]
            
            cache_key = v_meta.get("src") or v_html
            suggestion = cache.get(cache_key)
            explanation = ""
            
            if suggestion:
                explanation = "Retrieved instantly from de-duplication cache (saved API tokens)."
            else:
                ai_res = await remediator.get_remediation(v_type, v_html, v_ctx, v_meta)
                suggestion = ai_res["attribute_value"]
                explanation = ai_res["explanation"]
                cache.set(cache_key, suggestion)
            
            # Simple preview tag builder
            soup = BeautifulSoup(v_html, "html.parser")
            root = soup.find()
            if root:
                if "role=" in suggestion:
                    root["role"] = "button"
                    root["tabindex"] = "0"
                elif "aria-label=" in suggestion:
                    m = re.search(r'aria-label=["\'](.*?)["\']', suggestion)
                    if m:
                        root["aria-label"] = m.group(1)
                elif "alt=" in suggestion:
                    m = re.search(r'alt=["\'](.*?)["\']', suggestion)
                    if m:
                        root["alt"] = m.group(1)
                elif v_type == "missing_alt":
                    root["alt"] = suggestion
                elif v_type == "missing_button_label":
                    root["aria-label"] = suggestion
                elif v_type == "empty_link":
                    root["aria-label"] = suggestion
                elif v_type == "missing_html_lang":
                    root["lang"] = suggestion
            
            return {
                **v,
                "suggestion": suggestion,
                "explanation": explanation,
                "patched_html": str(soup)
            }

        tasks = [process_violation(v) for v in violations]
        processed_violations = await asyncio.gather(*tasks)

        patched_content = html_content
        for pv in processed_violations:
            patched_content = apply_precision_patch(patched_content, pv["html"], pv["suggestion"], filename, pv["selector"])

        results.append({
            "filename": filename,
            "original_score": max(0, 100 - len(violations) * 15),
            "patched_score": 100,
            "violations": processed_violations,
            "original_html": html_content,
            "patched_html": patched_content
        })

    return results

@app.post("/api/scan-workspace")
async def scan_workspace():
    """
    Active Workspace Scanner. Walks active repository directory, scans HTML/JSX/TSX,
    queries AI, and populates the results workspace.
    """
    files = crawl_workspace(WORKSPACE_DIR)
    results = []
    
    for f_info in files:
        filename = f_info["filename"]
        html_content = f_info["html"]
        SESSION_FILES[filename] = html_content
        
        violations = engine.scan_html(html_content, filename)
        
        async def process_violation(v):
            v_type = v["type"]
            v_html = v["html"]
            v_ctx = v["context"]
            v_meta = v["meta"]
            
            cache_key = v_meta.get("src") or v_html
            suggestion = cache.get(cache_key)
            explanation = ""
            
            if suggestion:
                explanation = "Retrieved instantly from de-duplication cache (saved API tokens)."
            else:
                ai_res = await remediator.get_remediation(v_type, v_html, v_ctx, v_meta)
                suggestion = ai_res["attribute_value"]
                explanation = ai_res["explanation"]
                cache.set(cache_key, suggestion)
                
            soup = BeautifulSoup(v_html, "html.parser")
            root = soup.find()
            if root:
                if "role=" in suggestion:
                    root["role"] = "button"
                    root["tabindex"] = "0"
                elif "aria-label=" in suggestion:
                    m = re.search(r'aria-label=["\'](.*?)["\']', suggestion)
                    if m:
                        root["aria-label"] = m.group(1)
                elif "alt=" in suggestion:
                    m = re.search(r'alt=["\'](.*?)["\']', suggestion)
                    if m:
                        root["alt"] = m.group(1)
                elif v_type == "missing_alt":
                    root["alt"] = suggestion
                elif v_type == "missing_button_label":
                    root["aria-label"] = suggestion
                elif v_type == "empty_link":
                    root["aria-label"] = suggestion
                elif v_type == "missing_html_lang":
                    root["lang"] = suggestion
                    
            return {
                **v,
                "suggestion": suggestion,
                "explanation": explanation,
                "patched_html": str(soup)
            }

        tasks = [process_violation(v) for v in violations]
        processed_violations = await asyncio.gather(*tasks)

        patched_content = html_content
        for pv in processed_violations:
            patched_content = apply_precision_patch(patched_content, pv["html"], pv["suggestion"], filename, pv["selector"])

        results.append({
            "filename": filename,
            "original_score": max(0, 100 - len(violations) * 15),
            "patched_score": 100,
            "violations": processed_violations,
            "original_html": html_content,
            "patched_html": patched_content
        })

    return results

@app.post("/api/patch")
async def patch_file(payload: PatchPayload):
    """
    Saves patches directly back to disk in the active developer workspace.
    """
    filename = payload.filename
    if filename not in SESSION_FILES:
        local_path = os.path.join(WORKSPACE_DIR, filename)
        if os.path.exists(local_path):
            with open(local_path, "r", encoding="utf-8") as f:
                SESSION_FILES[filename] = f.read()
        else:
            raise HTTPException(status_code=400, detail=f"File {filename} not registered in current session.")

    content = SESSION_FILES[filename]
    applied_count = 0
    
    for p in payload.patches:
        violations = engine.scan_html(content, filename)
        target_v = next((v for v in violations if v["id"] == p.id), None)
        
        if target_v:
            content = apply_precision_patch(content, target_v["html"], p.attribute_value, filename, target_v["selector"])
            applied_count += 1
            
    SESSION_FILES[filename] = content
    
    # Save back to physical file system
    local_path = os.path.join(WORKSPACE_DIR, filename)
    try:
        with open(local_path, "w", encoding="utf-8") as f:
            f.write(content)
    except Exception as e:
        print(f"[FSWrite] Error writing to {local_path}: {e}")
        raise HTTPException(status_code=500, detail=f"Filesystem write failed: {e}")

    return {
        "success": True,
        "filename": filename,
        "applied_count": applied_count,
        "final_html": content
    }

@app.post("/api/patch-all")
async def patch_all_files(payloads: List[PatchPayload]):
    """
    Batch applies approved suggestions across multiple workspace modules in one click.
    """
    patched_results = []
    for payload in payloads:
        res = await patch_file(payload)
        patched_results.append(res)
    return patched_results

@app.post("/api/scan-ai-generated")
async def scan_ai_generated():
    """
    Triggers dynamic crawling/generation of AI components (v0.dev outputs),
    audits them side-by-side, applies fixes, and returns the compiled report.
    """
    from github_ai_scanner import query_github_ai_code
    
    # Run the scanner
    success = await query_github_ai_code()
    
    # Read and return the report
    report_path = os.path.join(os.path.dirname(__file__), "a11y_ab_benchmark_report.json")
    if os.path.exists(report_path):
        try:
            with open(report_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading report: {e}")
    else:
        raise HTTPException(status_code=404, detail="A/B Benchmark report was not found.")

@app.get("/api/stats")
async def get_stats():
    return {
        "cache": cache.get_stats(),
        "files_remediated": len(SESSION_FILES)
    }

@app.post("/api/generate-dummy")
async def generate_dummy_workspace():
    """
    Generates dummy files in a local directory representing common AI UI failures.
    """
    os.makedirs(DUMMY_DIR, exist_ok=True)
    images_pool = [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",  # Office
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",  # Laptop
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",  # Team
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",   # Chart
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",  # Avatar/Portrait
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400",  # Support/Help
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",  # Product
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400"   # Code/Tech
    ]

    raw_pages = [
        {
            "filename": "dummy_web_project/index.tsx",
            "html": f"""import React from 'react';

export default function LandingPage() {{
    const handleNavigation = () => console.log("Navigate home");
    const toggleDarkMode = () => console.log("Toggle dark mode");

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            <header className="flex justify-between items-center border-b border-slate-700 pb-4">
                <div onClick={{handleNavigation}} className="cursor-pointer text-xl font-bold flex items-center gap-2">
                    <img src="{images_pool[4]}" className="w-8 h-8 rounded-full" />
                    <span>AI-CreativeStudio v0</span>
                </div>
                <button onClick={{toggleDarkMode}} className="p-2 hover:bg-slate-800 rounded">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </header>
            
            <main className="max-w-4xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="border border-slate-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Our Collaborative Workspace</h3>
                    <p className="text-slate-400 mb-4">Drafting custom designs inside our collaborative lab.</p>
                    <img src="{images_pool[0]}" className="w-full rounded" />
                </section>
                <section className="border border-slate-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Productivity Analytics</h3>
                    <p className="text-slate-400 mb-4">Depicting our weekly output metric progression.</p>
                    <img src="{images_pool[3]}" className="w-full rounded" />
                </section>
            </main>
        </div>
    );
}}"""
        },
        {
            "filename": "dummy_web_project/profile.tsx",
            "html": f"""import React from 'react';

export default function UserProfile() {{
    const saveChanges = () => alert("Saved changes!");
    
    return (
        <div className="max-w-md mx-auto mt-10 p-6 border border-slate-700 rounded-lg bg-slate-800">
            <h2 className="text-xl font-bold mb-6">Edit Profile Preferences</h2>
            
            <div className="space-y-4">
                <div>
                    <input id="email" type="email" placeholder="sarah.jenkins@company.com" className="w-full p-2 bg-slate-900 border border-slate-700 rounded" />
                </div>
                <div>
                    <input id="fullname" type="text" placeholder="Sarah Jenkins" className="w-full p-2 bg-slate-900 border border-slate-700 rounded" />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
                <div onClick={{saveChanges}} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer font-medium">
                    Save Changes
                </div>
            </div>
        </div>
    );
}}"""
        },
        {
            "filename": "dummy_web_project/dashboard.tsx",
            "html": f"""import React from 'react';

export default function DashboardConsole() {{
    const openSearch = () => console.log("Open search");
    const openSettings = () => console.log("Open settings");

    return (
        <div className="p-6 bg-slate-900 min-h-screen text-white">
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h1 className="text-lg font-bold">Workspace Console</h1>
                <div className="flex gap-2">
                    <button onClick={{openSearch}} className="p-2 border border-slate-700 rounded bg-slate-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    <button onClick={{openSettings}} className="p-2 border border-slate-700 rounded bg-slate-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={{2}} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div className="mt-8 text-center text-slate-500 text-sm">
                <span>Enterprise Dashboard Console</span>
            </div>
        </div>
    );
}}"""
        }
    ]

    results = []
    for page in raw_pages:
        fn = page["filename"]
        html_content = page["html"]
        local_path = os.path.join(WORKSPACE_DIR, fn)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        SESSION_FILES[fn] = html_content
        results.append({"filename": fn, "html": html_content})

    return results

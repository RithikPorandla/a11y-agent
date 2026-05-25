import os
import urllib.request
import ssl

def download_raw_github_code():
    print("=" * 70)
    print("🌐 CRAWLING OPEN-SOURCE GITHUB CODES FOR REAL-WORLD AUDITING...")
    print("=" * 70)

    # Official Facebook and Material-UI (MUI) React & HTML templates
    # 1. create-react-app (Facebook) - standard index.html (often misses lang tags)
    # 2. Material-UI (MUI Docs) - Unstyled Button React example component (clickable custom nodes)
    # 3. Material-UI (MUI Docs) - Titlebar Image List React example component (visual grid alt audits)
    sources = [
        {
            "name": "facebook_cra_index.html",
            "urls": [
                "https://raw.githubusercontent.com/facebook/create-react-app/main/packages/cra-template/template/public/index.html",
                "https://raw.githubusercontent.com/facebook/create-react-app/master/packages/cra-template/template/public/index.html"
            ],
            "description": "CRA Index Template (Facebook) - Official React app starter HTML"
        },
        {
            "name": "mui_unstyled_button.tsx",
            "urls": [
                "https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/components/buttons/UnstyledButtonsSimple.tsx",
                "https://raw.githubusercontent.com/mui/material-ui/main/docs/data/material/components/buttons/UnstyledButtonsSimple.tsx"
            ],
            "description": "MUI UnstyledButton (Material-UI) - Real interactive button TSX component"
        },
        {
            "name": "mui_image_list.tsx",
            "urls": [
                "https://raw.githubusercontent.com/mui/material-ui/master/docs/data/material/components/image-list/TitlebarImageList.tsx",
                "https://raw.githubusercontent.com/mui/material-ui/main/docs/data/material/components/image-list/TitlebarImageList.tsx"
            ],
            "description": "MUI TitlebarImageList (Material-UI) - Real media image card grid TSX component"
        }
    ]

    target_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "github_audited_project"))
    os.makedirs(target_dir, exist_ok=True)
    
    # Avoid SSL certificate errors on local development environments
    ssl_context = ssl._create_unverified_context()
    
    downloaded_files = []

    for src in sources:
        name = src["name"]
        urls = src["urls"]
        desc = src["description"]
        
        local_path = os.path.join(target_dir, name)
        
        print(f"📥 Fetching: {desc}...")
        
        success = False
        for url in urls:
            try:
                req = urllib.request.Request(
                    url, 
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                )
                with urllib.request.urlopen(req, context=ssl_context, timeout=10) as response:
                    content = response.read().decode('utf-8')
                    
                with open(local_path, "w", encoding="utf-8") as f:
                    f.write(content)
                    
                size = os.path.getsize(local_path)
                print(f"  ✅ Saved branch url ({size} bytes)")
                downloaded_files.append(local_path)
                success = True
                break
            except Exception as e:
                # Try next fallback URL branch
                continue
                
        if not success:
            print(f"  ❌ Failed downloading {name} from all branch fallbacks.")

    print("\n" + "=" * 70)
    print("📈 GITHUB CRAWLER OPERATION COMPLETED")
    print("=" * 70)
    print(f"Audited Project Folder: {target_dir}")
    print(f"Total Files Downloaded: {len(downloaded_files)} open-source components")
    print(f"Ready to run local terminal scan: ./cli/bin/index.js scan github_audited_project")
    print("=" * 70 + "\n")
    return downloaded_files

if __name__ == "__main__":
    download_raw_github_code()

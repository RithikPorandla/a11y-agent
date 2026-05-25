import os
import asyncio
from a11y_engine import A11yEngine
from ai_remediator import AIRemediator
from cache_manager import CacheManager

async def test_a11y_engine_and_parser():
    print("=" * 60)
    print("RUNNING AUTOMATED AUDIT ENGINE TESTS...")
    print("=" * 60)
    
    # Instantiate modules
    engine = A11yEngine()
    remediator = AIRemediator()
    cache = CacheManager()
    
    # 1. Verify Parser detects typical accessibility issues
    test_html = """
    <!DOCTYPE html>
    <html>
    <head><title>A11y Test Lab</title></head>
    <body>
        <h1>Title header element</h1>
        <p>Refer to the logo below:</p>
        
        <!-- Violation: img missing alt -->
        <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" />
        
        <!-- Violation: SVG button missing aria-label -->
        <button style="border: none;">
            <svg class="search" viewBox="0 0 24 24"><path d="M21 21l-6-6"/></svg>
        </button>

        <!-- Violation: Anchor link with empty text -->
        <a href="https://github.com/a11y-agent"></a>
    </body>
    </html>
    """
    
    violations = engine.scan_html(test_html)
    print(f"[A11yEngine] Audited elements. Discovered {len(violations)} violations.")
    
    # We expect 4 violations: missing html lang, missing image alt, missing button label, empty link
    types_found = [v["type"] for v in violations]
    print(f"[A11yEngine] Discovered violation types: {types_found}")
    
    assert "missing_html_lang" in types_found, "Failed to detect missing HTML language."
    assert "missing_alt" in types_found, "Failed to detect missing alt attribute."
    assert "unlabelled_svg" in types_found or "missing_button_label" in types_found, "Failed to detect missing aria-label on interactive button."
    assert "empty_link" in types_found, "Failed to detect empty text link."
    print("✅ [A11yEngine] HTML Parsing and Auditing passed perfectly!")

    # 2. Verify AI Remediation Simulator
    print("\n[AIRemediator] Testing AI recommendations...")
    img_violation = next(v for v in violations if v["type"] == "missing_alt")
    ai_res = await remediator.get_remediation(
        img_violation["type"], 
        img_violation["html"], 
        img_violation["context"], 
        img_violation["meta"]
    )
    print(f"[AIRemediator] AI suggestion for laptop image: alt='{ai_res['attribute_value']}'")
    assert len(ai_res["attribute_value"]) > 0, "AI failed to generate alt recommendation."
    print("✅ [AIRemediator] Suggestion and rationale generation passed perfectly!")

    # 3. Verify Cache Manager De-duplication
    print("\n[CacheManager] Testing persistent caching and token economy stats...")
    test_url = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400"
    
    # Clean any old value
    if test_url in cache.cache:
        del cache.cache[test_url]
    
    # Retrieve on cache miss
    cached_val = cache.get(test_url)
    assert cached_val == "", "Cache did not register miss correctly."
    
    # Store and retrieve
    cache.set(test_url, ai_res["attribute_value"])
    cached_val = cache.get(test_url)
    assert cached_val == ai_res["attribute_value"], "Cache failed to retrieve correct key value."
    print(f"[CacheManager] Cache hit recorded! Cache stats: {cache.get_stats()}")
    assert cache.hits == 1, "Cache hit statistics miscounted."
    print("✅ [CacheManager] De-duplication caching passed perfectly!")

    print("=" * 60)
    print("🎉 ALL TESTS PASSED! CODEBASE READY FOR INTEGRATION.")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_a11y_engine_and_parser())

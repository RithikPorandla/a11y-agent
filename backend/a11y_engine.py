import hashlib
import re
from bs4 import BeautifulSoup
from typing import List, Dict, Any

class A11yEngine:
    @staticmethod
    def generate_id(element_html: str) -> str:
        """
        Generates a stable unique ID for the violation based on element contents.
        """
        return hashlib.md5(element_html.encode('utf-8')).hexdigest()[:8]

    @staticmethod
    def get_selector(element) -> str:
        """
        Builds a simple CSS selector path for the element.
        """
        path = []
        parent = element
        while parent and parent.name != '[document]':
            siblings = parent.find_previous_siblings(parent.name)
            index = len(siblings) + 1
            if index > 1:
                path.append(f"{parent.name}:nth-of-type({index})")
            else:
                path.append(parent.name)
            parent = parent.parent
        return " > ".join(reversed(path))

    def preprocess_jsx(self, content: str) -> str:
        """
        Cleans up JSX/TSX curly brace syntax and event handlers so BeautifulSoup
        can parse it like standard HTML without breaking.
        """
        # Replace JSX attribute expressions like src={mySrc} with standard strings
        cleaned = re.sub(r'=(\{[^{}]*\})', r'="jsx-expression"', content)
        # Handle nested expressions
        for _ in range(3):
            cleaned = re.sub(r'=(\{[^{}]*\{[^{}]*\}[^{}]*\})', r'="jsx-expression"', cleaned)
        
        # Replace event handlers like onClick={...} with standard HTML attribute
        cleaned = re.sub(r'(\b\w+)(={?jsx-expression}?|=({[^{}]+}))', r'\1="react-handler"', cleaned)
        return cleaned

    def scan_html(self, html_content: str, filename: str = "index.html") -> List[Dict[str, Any]]:
        """
        Scans HTML/JSX/TSX text and returns a list of accessibility violations.
        """
        is_jsx = filename.endswith((".tsx", ".jsx"))
        
        if is_jsx:
            parsed_content = self.preprocess_jsx(html_content)
        else:
            parsed_content = html_content

        soup = BeautifulSoup(parsed_content, "html.parser")
        violations = []

        # 1. Rule: Missing HTML Lang (Only for HTML files)
        if not is_jsx:
            html_tag = soup.find("html")
            if html_tag and not html_tag.get("lang"):
                target_html = str(html_tag)[:150] + "..."
                violations.append({
                    "id": self.generate_id(target_html),
                    "type": "missing_html_lang",
                    "element": "html",
                    "selector": "html",
                    "html": str(html_tag)[:250] + "...",
                    "context": "Root document level",
                    "description": "The <html> element is missing a 'lang' attribute, which prevents screen readers from pronouncing words correctly.",
                    "meta": {}
                })

        # 2. Rule: Div-Button (Clickable non-interactive tags in JSX/HTML)
        # Find elements that have onClick handlers but are not native interactive elements
        interactive_tags = {"button", "a", "input", "select", "textarea", "form", "option"}
        for element in soup.find_all(True):
            if element.name in interactive_tags:
                continue
            
            # Check if has onClick style event handler or custom handler attributes
            has_click = (
                element.has_attr("onclick") or 
                element.has_attr("onclick") or 
                element.has_attr("onclick") or
                element.has_attr("onClick") or 
                element.has_attr("onclick")
            )
            # Check case-insensitively or standard attributes
            for attr in element.attrs:
                if attr.lower() in ("onclick", "ontap", "onpress"):
                    has_click = True
                    break

            if has_click:
                role = element.get("role")
                tabindex = element.get("tabindex") or element.get("tabIndex")
                
                # Flag if role is not button, or missing tabIndex
                if role != "button" or tabindex is None:
                    target_html = str(element)[:300]
                    parent_ctx = str(element.parent)[:300]
                    violations.append({
                        "id": self.generate_id(target_html),
                        "type": "div_button",
                        "element": element.name,
                        "selector": self.get_selector(element),
                        "html": target_html,
                        "context": parent_ctx,
                        "description": f"Clickable <{element.name}> has no role='button' or tabIndex, making it completely invisible to keyboard navigators and screen readers.",
                        "meta": {
                            "tag": element.name,
                            "has_role": role == "button",
                            "has_tabindex": tabindex is not None
                        }
                    })

        # 3. Rule: Images for Missing Alt Text
        for img in soup.find_all("img"):
            alt = img.get("alt")
            src = img.get("src") or ""
            if alt is None:
                target_html = str(img)
                parent_ctx = str(img.parent)[:300]
                violations.append({
                    "id": self.generate_id(target_html),
                    "type": "missing_alt",
                    "element": "img",
                    "selector": self.get_selector(img),
                    "html": target_html,
                    "context": parent_ctx,
                    "description": "Image is missing an 'alt' attribute, making it invisible to screen readers.",
                    "meta": {"src": src}
                })

        # 4. Rule: Interactive Buttons with No Text / SVG Icons with no label
        for btn in soup.find_all("button"):
            aria_label = btn.get("aria-label")
            aria_labelledby = btn.get("aria-labelledby")
            title = btn.get("title")
            inner_text = btn.get_text(strip=True)

            if not (aria_label or aria_labelledby or title or inner_text):
                target_html = str(btn)
                parent_ctx = str(btn.parent)[:300]
                has_svg = bool(btn.find("svg"))
                violations.append({
                    "id": self.generate_id(target_html),
                    "type": "unlabelled_svg" if has_svg else "missing_button_label",
                    "element": "button",
                    "selector": self.get_selector(btn),
                    "html": target_html,
                    "context": parent_ctx,
                    "description": f"Icon button has no text content or 'aria-label', leaving screen readers with no way to identify its action.",
                    "meta": {"has_svg": has_svg}
                })

        # 5. Rule: Links with Empty Text
        for link in soup.find_all("a"):
            aria_label = link.get("aria-label")
            title = link.get("title")
            inner_text = link.get_text(strip=True)
            href = link.get("href") or "#"

            if not (aria_label or title or inner_text) and not link.find("img"):
                target_html = str(link)
                parent_ctx = str(link.parent)[:300]
                violations.append({
                    "id": self.generate_id(target_html),
                    "type": "empty_link",
                    "element": "a",
                    "selector": self.get_selector(link),
                    "html": target_html,
                    "context": parent_ctx,
                    "description": "Link has no descriptive text, leaving its destination completely blank to screen readers.",
                    "meta": {"href": href}
                })

        # 6. Rule: Disconnected Input Fields (Inputs without Labels)
        for inp in soup.find_all(["input", "textarea", "select"]):
            # Ignore hidden inputs or submit/buttons
            inp_type = inp.get("type", "").lower()
            if inp_type in ("hidden", "submit", "button", "image"):
                continue

            aria_label = inp.get("aria-label")
            aria_labelledby = inp.get("aria-labelledby")
            inp_id = inp.get("id")
            placeholder = inp.get("placeholder")
            title = inp.get("title")

            # Check if has associated label
            has_label = False
            # Check parent label
            if inp.find_parent("label"):
                has_label = True
            # Check label with 'for' matching id
            elif inp_id:
                label = soup.find("label", attrs={"for": inp_id}) or soup.find("label", attrs={"htmlfor": inp_id}) or soup.find("label", attrs={"htmlFor": inp_id})
                if label:
                    has_label = True

            if not (aria_label or aria_labelledby or title or has_label):
                target_html = str(inp)
                parent_ctx = str(inp.parent)[:300]
                violations.append({
                    "id": self.generate_id(target_html),
                    "type": "input_no_label",
                    "element": inp.name,
                    "selector": self.get_selector(inp),
                    "html": target_html,
                    "context": parent_ctx,
                    "description": f"Form control <{inp.name}> has no associated <label> or 'aria-label', making it extremely difficult for screen reader users to know what data to input.",
                    "meta": {
                        "id": inp_id,
                        "placeholder": placeholder,
                        "name": inp.get("name")
                    }
                })

        return violations

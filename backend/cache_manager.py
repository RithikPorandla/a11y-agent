import os
import json
from typing import Dict

CACHE_FILE = os.path.join(os.path.dirname(__file__), "a11y_cache.json")

class CacheManager:
    def __init__(self):
        self.cache_path = CACHE_FILE
        self.cache = self._load_cache()
        self.hits = 0
        self.misses = 0

    def _load_cache(self) -> Dict[str, str]:
        if os.path.exists(self.cache_path):
            try:
                with open(self.cache_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[CacheManager] Warning: failed to parse cache, starting fresh: {e}")
                return {}
        return {}

    def save_cache(self):
        try:
            with open(self.cache_path, "w", encoding="utf-8") as f:
                json.dump(self.cache, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[CacheManager] Warning: failed to save cache: {e}")

    def get(self, image_url: str) -> str:
        """
        Retrieves alt text for a given image URL if cached.
        """
        if image_url in self.cache:
            self.hits += 1
            return self.cache[image_url]
        self.misses += 1
        return ""

    def set(self, image_url: str, alt_text: str):
        """
        Caches a newly generated alt text.
        """
        self.cache[image_url] = alt_text
        self.save_cache()

    def get_stats(self) -> Dict:
        return {
            "total_items": len(self.cache),
            "hits": self.hits,
            "misses": self.misses,
            "cost_saved_usd": round(self.hits * 0.00015, 5) # Rough estimation of vision prompt cost saved
        }

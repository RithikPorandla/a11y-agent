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
        
        self.redis_client = None
        self.redis_active = False
        
        # Load Redis configurations from environments
        REDIS_HOST = os.getenv("REDIS_HOST", "127.0.0.1")
        try:
            REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
        except:
            REDIS_PORT = 6379
        REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
        
        try:
            import redis
            self.redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                password=REDIS_PASSWORD,
                socket_timeout=1.0,  # Strict sub-second timeout to prevent blocking when offline
                decode_responses=True
            )
            # Connection check
            if self.redis_client.ping():
                self.redis_active = True
                print(f"[CacheManager] Connected to shared Redis cache at {REDIS_HOST}:{REDIS_PORT}")
        except Exception as e:
            print(f"[CacheManager] Redis not connected. Using local file cache fallback instead. Details: {e}")

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

    def get(self, key: str) -> str:
        """
        Retrieves suggestion for a given element key, checking Redis first and falling back locally.
        """
        if self.redis_active:
            try:
                res = self.redis_client.get(key)
                if res is not None:
                    self.hits += 1
                    return res
            except Exception as e:
                print(f"[CacheManager] Redis read warning: {e}. Falling back locally.")
                
        if key in self.cache:
            self.hits += 1
            return self.cache[key]
            
        self.misses += 1
        return ""

    def set(self, key: str, value: str):
        """
        Caches suggestion in Redis (if active) and mirrors locally to keep files in sync.
        """
        if self.redis_active:
            try:
                self.redis_client.set(key, value)
            except Exception as e:
                print(f"[CacheManager] Redis write warning: {e}")
                
        self.cache[key] = value
        self.save_cache()

    def get_stats(self) -> Dict:
        redis_size = 0
        if self.redis_active:
            try:
                redis_size = self.redis_client.dbsize()
            except:
                pass
                
        return {
            "cache_type": "Redis (Shared Database)" if self.redis_active else "Local File Cache",
            "total_items": redis_size if self.redis_active else len(self.cache),
            "hits": self.hits,
            "misses": self.misses,
            "cost_saved_usd": round(self.hits * 0.00015, 5)
        }


import type { Cache, CachedSegment } from "../types/cache.js";

interface Entry {
  value: CachedSegment;
  expires: number;
}

export const createCache = (max = 600, ttlMs = 5000): Cache => {
  const map = new Map<string, Entry>();

  return {
    get(key: string): CachedSegment | null {
      const entry = map.get(key);
      if (!entry || entry.expires < Date.now()) {
        map.delete(key);
        return null;
      }

      // Keep hot keys alive in insertion order so oldest eviction behaves closer to LRU.
      map.delete(key);
      map.set(key, entry);
      return entry.value;
    },
    set(key: string, value: CachedSegment): void {
      if (map.size >= max) {
        const oldestKey = map.keys().next().value;
        if (oldestKey !== undefined) {
          map.delete(oldestKey);
        }
      }

      map.set(key, { value, expires: Date.now() + ttlMs });
    },
  };
};

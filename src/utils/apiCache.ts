interface CacheItem<T> {
  data: T;
  expiry: number;
}

class SimpleCache {
  private store = new Map<string, CacheItem<any>>();

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.data;
  }

  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    this.store.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const apiCache = new SimpleCache();
export default apiCache;

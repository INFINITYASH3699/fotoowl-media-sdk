/**
 * ============================================================
 * media-core — In-Memory Cache with Request De-duplication
 * ============================================================
 * Two responsibilities:
 *   1. Cache successful responses for a TTL window
 *   2. De-dupe concurrent identical requests (single flight)
 * ============================================================
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class Cache {
  private store = new Map<string, CacheEntry<unknown>>();
  private pending = new Map<string, Promise<unknown>>();
  private ttl: number;

  constructor(ttl: number) {
    this.ttl = ttl;
  }

  /** Get cached value if fresh, else undefined */
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  /** Store value with current TTL */
  set<T>(key: string, data: T): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + this.ttl,
    });
  }

  /** Check if a key is currently cached and fresh */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /** Clear all cache entries */
  clear(): void {
    this.store.clear();
    this.pending.clear();
  }

  /** Remove a specific key */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Single-flight de-duplication.
   * If a request with the same key is already in-flight,
   * subscribers get the same promise (no duplicate network call).
   */
  async dedupe<T>(key: string, factory: () => Promise<T>): Promise<T> {
    // Cache hit
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;

    // Already in-flight
    const inflight = this.pending.get(key);
    if (inflight) return inflight as Promise<T>;

    // Fire the request, share promise, clean up when done
    const promise = factory()
      .then((data) => {
        this.set(key, data);
        return data;
      })
      .finally(() => {
        this.pending.delete(key);
      });

    this.pending.set(key, promise);
    return promise;
  }
}

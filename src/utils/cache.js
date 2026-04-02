/**
 * Simple in-memory TTL cache.
 * Intended for settings and other rarely-changing data to avoid
 * repeated DB round-trips on hot paths (e.g. every submitGuess call).
 *
 * Usage:
 *   const cache = require('./cache');
 *   cache.set('key', value, 5 * 60 * 1000); // 5-minute TTL
 *   const v = cache.get('key');              // undefined when expired/missing
 *   cache.del('key');                        // manual invalidation
 */

class Cache {
  constructor() {
    this._store = new Map();
  }

  /**
   * Retrieve a cached value.  Returns `undefined` when missing or expired.
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    const entry = this._store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  /**
   * Store a value with a TTL.
   * @param {string} key
   * @param {*}      value
   * @param {number} ttlMs  Milliseconds until expiry (default: 60 s)
   */
  set(key, value, ttlMs = 60_000) {
    this._store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /**
   * Remove a single entry.
   * @param {string} key
   */
  del(key) {
    this._store.delete(key);
  }

  /** Remove all entries whose keys start with `prefix`. */
  delByPrefix(prefix) {
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) this._store.delete(key);
    }
  }

  /** Clear the entire cache. */
  flush() {
    this._store.clear();
  }
}

// Export singleton so all modules share the same cache instance.
module.exports = new Cache();

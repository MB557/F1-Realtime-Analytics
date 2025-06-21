export class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = parseInt(process.env.CACHE_TTL_SECONDS) * 1000 || 30000; // Default 30 seconds
    this.maxSize = parseInt(process.env.MAX_CACHE_SIZE) || 1000;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Set a value in the cache with TTL
   */
  set(key, value) {
    // Remove oldest entries if we're at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const expiry = Date.now() + this.ttl;
    this.cache.set(key, {
      value,
      expiry,
      accessed: Date.now()
    });
  }

  /**
   * Get a value from the cache
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Update access time for LRU-like behavior
    item.accessed = Date.now();
    return item.value;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      expired: entries.filter(([, item]) => now > item.expiry).length,
      memoryUsage: this.estimateMemoryUsage(),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(([, item]) => item.accessed)) : null,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(([, item]) => item.accessed)) : null
    };
  }

  /**
   * Get all cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all cache entries that are not expired
   */
  entries() {
    const now = Date.now();
    const validEntries = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now <= item.expiry) {
        validEntries.push([key, item.value]);
      }
    }
    
    return validEntries;
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  estimateMemoryUsage() {
    let size = 0;
    
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // Rough estimate for string keys
      size += JSON.stringify(item.value).length * 2; // Rough estimate for values
      size += 32; // Overhead for expiry, accessed timestamps, etc.
    }
    
    return size;
  }

  /**
   * Set TTL for future cache entries
   */
  setTTL(ttlSeconds) {
    this.ttl = ttlSeconds * 1000;
  }

  /**
   * Get current TTL in seconds
   */
  getTTL() {
    return this.ttl / 1000;
  }

  /**
   * Set maximum cache size
   */
  setMaxSize(maxSize) {
    this.maxSize = maxSize;
    
    // If current size exceeds new max, remove oldest entries
    while (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Get maximum cache size
   */
  getMaxSize() {
    return this.maxSize;
  }
} 
/**
 * Lightweight in-memory TTL cache — no external dependencies.
 * Uses a Map keyed by string with expiry timestamps.
 * Suitable for caching DB query results that don't change every request.
 */

const store = new Map();

// Auto-evict expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now > entry.expiresAt) store.delete(key);
    }
}, 5 * 60 * 1000);

export const cache = {
    /**
     * Get a cached value. Returns null if missing or expired.
     * @param {string} key
     */
    get(key) {
        const entry = store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            store.delete(key);
            return null;
        }
        return entry.value;
    },

    /**
     * Store a value with a TTL.
     * @param {string} key
     * @param {*} value
     * @param {number} ttlSeconds — default 60s
     */
    set(key, value, ttlSeconds = 60) {
        store.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    },

    /**
     * Remove a specific key immediately.
     * @param {string} key
     */
    invalidate(key) {
        store.delete(key);
    },

    /**
     * Remove all keys that start with the given prefix.
     * Use to bust an entire category (e.g. 'resources:').
     * @param {string} prefix
     */
    invalidatePattern(prefix) {
        for (const key of store.keys()) {
            if (key.startsWith(prefix)) store.delete(key);
        }
    },

    /** Number of live entries (for debugging). */
    size() {
        return store.size;
    },
};

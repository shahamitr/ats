const Redis = require('ioredis');

const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    // This option is important for graceful shutdown and error handling
    maxRetriesPerRequest: 1, 
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err.message));
redisClient.on('connect', () => console.log('Connected to Redis successfully.'));

/**
 * Express middleware for caching responses in Redis.
 * @param {number} ttlSeconds - The Time-To-Live for the cache in seconds.
 */
function cache(ttlSeconds) {
    return async (req, res, next) => {
        // Use a consistent key format. Here, we use the original URL.
        const key = `cache:${req.originalUrl}`;

        try {
            const cachedData = await redisClient.get(key);

            if (cachedData) {
                console.log(`CACHE HIT: ${key}`);
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('X-Cache', 'HIT');
                return res.send(cachedData); // No need to parse, send as is
            } else {
                console.log(`CACHE MISS: ${key}`);
                res.setHeader('X-Cache', 'MISS');
                
                // Override res.send to cache the response before sending it
                const originalSend = res.send;
                res.send = (body) => {
                    // Only cache successful responses
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        redisClient.set(key, body, 'EX', ttlSeconds);
                    }
                    return originalSend.call(res, body);
                };

                next();
            }
        } catch (error) {
            console.error('Redis cache read error:', error.message);
            // If Redis fails, proceed without caching to keep the app alive
            next();
        }
    };
}

/**
 * Invalidates all cache keys matching a given prefix.
 * Uses SCAN to avoid blocking the Redis server.
 * @param {string} prefix - The prefix of the keys to invalidate (e.g., 'cache:/api/candidates')
 */
async function invalidateCache(prefix) {
    try {
        const stream = redisClient.scanStream({
            match: `${prefix}*`,
            count: 100,
        });
        const keysToDelete = [];
        stream.on('data', (keys) => keys.forEach(key => keysToDelete.push(key)));
        stream.on('end', async () => {
            if (keysToDelete.length > 0) {
                console.log(`Invalidating ${keysToDelete.length} cache keys with prefix: ${prefix}`);
                await redisClient.del(keysToDelete);
            }
        });
    } catch (error) {
        console.error('Redis cache invalidation error:', error.message);
    }
}

module.exports = { cache, invalidateCache, redisClient };
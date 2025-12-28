/**
 * Rate Limiter Utility
 * Client-side rate limiting for sensitive operations
 */

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Default configs for different operation types
export const RATE_LIMITS = {
    AUTH: { maxRequests: 5, windowMs: 60000 }, // 5 requests per minute
    API_WRITE: { maxRequests: 30, windowMs: 60000 }, // 30 writes per minute
    API_READ: { maxRequests: 100, windowMs: 60000 }, // 100 reads per minute
    EXPORT: { maxRequests: 5, windowMs: 300000 }, // 5 exports per 5 minutes
} as const;

/**
 * Check if an operation is rate limited
 * @param key Unique identifier (e.g., "auth:login", "api:createInvoice")
 * @param config Rate limit configuration
 * @returns Object indicating if limited and remaining requests
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig = RATE_LIMITS.API_WRITE
): { limited: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
        rateLimitStore.delete(key);
    }

    const current = rateLimitStore.get(key);

    if (!current) {
        // First request in window
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return { limited: false, remaining: config.maxRequests - 1, resetIn: config.windowMs };
    }

    if (current.count >= config.maxRequests) {
        // Rate limited
        return {
            limited: true,
            remaining: 0,
            resetIn: current.resetTime - now,
        };
    }

    // Increment and allow
    current.count++;
    return {
        limited: false,
        remaining: config.maxRequests - current.count,
        resetIn: current.resetTime - now,
    };
}

/**
 * Rate limiter hook for React components
 */
export function useRateLimiter(key: string, config: RateLimitConfig = RATE_LIMITS.API_WRITE) {
    const tryRequest = (): boolean => {
        const result = checkRateLimit(key, config);
        return !result.limited;
    };

    const getRemainingRequests = (): number => {
        const result = checkRateLimit(key, config);
        return result.remaining;
    };

    return { tryRequest, getRemainingRequests };
}

/**
 * Decorator for rate-limited async functions
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    key: string,
    config: RateLimitConfig = RATE_LIMITS.API_WRITE
): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        const result = checkRateLimit(key, config);

        if (result.limited) {
            const seconds = Math.ceil(result.resetIn / 1000);
            throw new Error(`Rate limited. Please try again in ${seconds} seconds.`);
        }

        return fn(...args);
    }) as T;
}

/**
 * Clear rate limit for a specific key (useful after successful auth)
 */
export function clearRateLimit(key: string): void {
    rateLimitStore.delete(key);
}

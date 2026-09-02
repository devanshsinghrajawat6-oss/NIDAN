type RateLimitStore = Map<string, { count: number, resetTime: number }>;

const store: RateLimitStore = new Map();

/**
 * Basic in-memory rate limiter
 * @param ip Client IP address or identifier
 * @param limit Maximum number of requests allowed within the window
 * @param windowMs Time window in milliseconds (e.g., 60000 for 1 minute)
 * @returns { success: boolean, remaining: number, reset: number }
 */
export function rateLimit(ip: string, limit: number = 100, windowMs: number = 60000) {
  const now = Date.now();
  
  if (!store.has(ip)) {
    store.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  const record = store.get(ip)!;

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { success: true, remaining: limit - 1, reset: record.resetTime };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, reset: record.resetTime };
}

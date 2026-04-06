// Simple in-memory rate limiter for serverless
// In production, use Redis or Upstash for distributed rate limiting

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// Presets
export function rateLimitOTP(email: string): RateLimitResult {
  return rateLimit(`otp:${email}`, 5, 60 * 60 * 1000); // 5 per hour
}

export function rateLimitAPI(ip: string): RateLimitResult {
  return rateLimit(`api:${ip}`, 100, 60 * 1000); // 100 per minute
}

export function rateLimitLogin(ip: string): RateLimitResult {
  return rateLimit(`login:${ip}`, 10, 15 * 60 * 1000); // 10 per 15 min
}

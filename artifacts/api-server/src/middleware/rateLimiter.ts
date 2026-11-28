import type { Request, Response, NextFunction } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Lightweight sliding-window IP rate limiter (zero external dependency).
 */
export function createRateLimiter(opts: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  const buckets = new Map<string, Bucket>();

  // Periodic cleanup to keep memory bounded
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets.entries()) {
      if (b.resetAt <= now) buckets.delete(key);
    }
  }, Math.max(opts.windowMs, 60_000));
  cleanupTimer.unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : String(forwarded || "").split(",")[0])?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      "unknown";
    const key = `${ip}:${req.baseUrl || ""}:${req.path}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + opts.windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    const remaining = Math.max(0, opts.max - bucket.count);
    res.setHeader("RateLimit-Limit", String(opts.max));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil((bucket.resetAt - now) / 1000)));

    if (bucket.count > opts.max) {
      res.status(429).json({
        ok: false,
        success: false,
        error: opts.message || "Too many requests. Please wait a moment and try again.",
        code: "RATE_LIMIT_EXCEEDED",
      });
      return;
    }

    next();
  };
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: "Too many login or OTP attempts. Please try again in a few minutes.",
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: "Upload rate limit reached. Please try again shortly.",
});

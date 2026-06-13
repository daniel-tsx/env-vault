import { db } from "@/db";
import { appRateLimit } from "@/db/schema";
import { eq } from "drizzle-orm";

export type RateLimitDecision = {
  allowed: boolean;
  nextCount: number;
  nextWindowStartMs: number;
  retryAfterSeconds: number;
};

/**
 * Pure fixed-window decision: given the current stored state, decides whether a
 * request is allowed and what the next stored state should be. Kept separate
 * from DB I/O so it can be unit-tested deterministically.
 */
export function evaluateWindow(params: {
  now: number;
  windowStartMs: number | null;
  count: number;
  limit: number;
  windowMs: number;
}): RateLimitDecision {
  const { now, windowStartMs, count, limit, windowMs } = params;

  // No prior state, or the previous window has elapsed -> start a fresh window.
  if (windowStartMs === null || now - windowStartMs >= windowMs) {
    return {
      allowed: true,
      nextCount: 1,
      nextWindowStartMs: now,
      retryAfterSeconds: 0,
    };
  }

  if (count >= limit) {
    return {
      allowed: false,
      nextCount: count,
      nextWindowStartMs: windowStartMs,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((windowStartMs + windowMs - now) / 1000)
      ),
    };
  }

  return {
    allowed: true,
    nextCount: count + 1,
    nextWindowStartMs: windowStartMs,
    retryAfterSeconds: 0,
  };
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

/**
 * DB-backed fixed-window rate limit. Fails open: if the limiter store is
 * unavailable (e.g. table not yet migrated, transient error) the request is
 * allowed, so users are never locked out of their own data by limiter issues.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  try {
    const [row] = await db
      .select()
      .from(appRateLimit)
      .where(eq(appRateLimit.key, key))
      .limit(1);

    const decision = evaluateWindow({
      now,
      windowStartMs: row ? row.windowStart.getTime() : null,
      count: row?.count ?? 0,
      limit,
      windowMs,
    });

    if (!decision.allowed) {
      return { allowed: false, retryAfterSeconds: decision.retryAfterSeconds };
    }

    await db
      .insert(appRateLimit)
      .values({
        key,
        count: decision.nextCount,
        windowStart: new Date(decision.nextWindowStartMs),
      })
      .onConflictDoUpdate({
        target: appRateLimit.key,
        set: {
          count: decision.nextCount,
          windowStart: new Date(decision.nextWindowStartMs),
        },
      });

    return { allowed: true, retryAfterSeconds: 0 };
  } catch {
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

// Sensible defaults for sensitive secret-access actions.
export const REVEAL_LIMIT = 30;
export const REVEAL_WINDOW_SECONDS = 60;
export const EXPORT_LIMIT = 10;
export const EXPORT_WINDOW_SECONDS = 60;
// Tight limit on step-up password attempts to resist brute force.
export const STEP_UP_LIMIT = 5;
export const STEP_UP_WINDOW_SECONDS = 60;

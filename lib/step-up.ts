import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// A "reveal grant" proves the user recently re-authenticated (step-up) before
// secrets can be revealed/exported. It's a short-lived, httpOnly, signed cookie
// bound to the current session id — no DB row, so it can't be replayed in
// another session and needs no migration.
const COOKIE_NAME = "ev_reveal_grant";
export const STEP_UP_TTL_SECONDS = 5 * 60;

function sign(payload: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not set");
  }
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createGrantToken(sessionId: string, expiresAtMs: number): string {
  const payload = `${sessionId}.${expiresAtMs}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyGrantToken(
  token: string,
  sessionId: string,
  now: number = Date.now()
): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [sid, expString, signature] = parts;
  const expected = sign(`${sid}.${expString}`);

  const provided = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (
    provided.length !== expectedBuf.length ||
    !timingSafeEqual(provided, expectedBuf)
  ) {
    return false;
  }

  if (sid !== sessionId) return false;

  const expiresAt = Number(expString);
  return Number.isFinite(expiresAt) && expiresAt > now;
}

export async function hasValidRevealGrant(sessionId: string): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyGrantToken(token, sessionId);
}

export async function issueRevealGrant(sessionId: string): Promise<void> {
  const expiresAtMs = Date.now() + STEP_UP_TTL_SECONDS * 1000;
  (await cookies()).set(COOKIE_NAME, createGrantToken(sessionId, expiresAtMs), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STEP_UP_TTL_SECONDS,
  });
}

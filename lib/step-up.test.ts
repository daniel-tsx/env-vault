import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createGrantToken, verifyGrantToken } from "./step-up";

const ORIGINAL = process.env.BETTER_AUTH_SECRET;

beforeEach(() => {
  process.env.BETTER_AUTH_SECRET = "test-secret-value";
});
afterEach(() => {
  process.env.BETTER_AUTH_SECRET = ORIGINAL;
});

describe("reveal grant token", () => {
  test("verifies a fresh token for the same session", () => {
    const token = createGrantToken("sess-1", Date.now() + 60_000);
    expect(verifyGrantToken(token, "sess-1")).toBe(true);
  });

  test("rejects an expired token", () => {
    const token = createGrantToken("sess-1", Date.now() - 1);
    expect(verifyGrantToken(token, "sess-1")).toBe(false);
  });

  test("rejects a token bound to a different session", () => {
    const token = createGrantToken("sess-1", Date.now() + 60_000);
    expect(verifyGrantToken(token, "sess-2")).toBe(false);
  });

  test("rejects a tampered signature", () => {
    const token = createGrantToken("sess-1", Date.now() + 60_000);
    const parts = token.split(".");
    parts[2] = parts[2].slice(0, -1) + (parts[2].slice(-1) === "A" ? "B" : "A");
    expect(verifyGrantToken(parts.join("."), "sess-1")).toBe(false);
  });

  test("rejects a forged expiry (signature no longer matches)", () => {
    const token = createGrantToken("sess-1", Date.now() + 1000);
    const [sid, , sig] = token.split(".");
    const forged = `${sid}.${Date.now() + 9_000_000}.${sig}`;
    expect(verifyGrantToken(forged, "sess-1")).toBe(false);
  });

  test("rejects malformed tokens", () => {
    expect(verifyGrantToken("garbage", "sess-1")).toBe(false);
    expect(verifyGrantToken("a.b", "sess-1")).toBe(false);
  });
});

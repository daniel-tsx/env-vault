import { describe, expect, test } from "vitest";
import { evaluateWindow } from "./rate-limit";

const WINDOW_MS = 60_000;
const LIMIT = 5;

describe("evaluateWindow", () => {
  test("first request starts a new window", () => {
    const d = evaluateWindow({
      now: 1000,
      windowStartMs: null,
      count: 0,
      limit: LIMIT,
      windowMs: WINDOW_MS,
    });
    expect(d.allowed).toBe(true);
    expect(d.nextCount).toBe(1);
    expect(d.nextWindowStartMs).toBe(1000);
  });

  test("increments within the window", () => {
    const d = evaluateWindow({
      now: 5000,
      windowStartMs: 1000,
      count: 2,
      limit: LIMIT,
      windowMs: WINDOW_MS,
    });
    expect(d.allowed).toBe(true);
    expect(d.nextCount).toBe(3);
    expect(d.nextWindowStartMs).toBe(1000);
  });

  test("blocks once the limit is reached", () => {
    const d = evaluateWindow({
      now: 5000,
      windowStartMs: 1000,
      count: LIMIT,
      limit: LIMIT,
      windowMs: WINDOW_MS,
    });
    expect(d.allowed).toBe(false);
    expect(d.nextCount).toBe(LIMIT);
    expect(d.retryAfterSeconds).toBe(56); // (1000 + 60000 - 5000) / 1000
  });

  test("resets after the window elapses", () => {
    const d = evaluateWindow({
      now: 1000 + WINDOW_MS,
      windowStartMs: 1000,
      count: LIMIT,
      limit: LIMIT,
      windowMs: WINDOW_MS,
    });
    expect(d.allowed).toBe(true);
    expect(d.nextCount).toBe(1);
    expect(d.nextWindowStartMs).toBe(1000 + WINDOW_MS);
  });

  test("retryAfter is at least 1 second", () => {
    const d = evaluateWindow({
      now: 1000 + WINDOW_MS - 100,
      windowStartMs: 1000,
      count: LIMIT,
      limit: LIMIT,
      windowMs: WINDOW_MS,
    });
    expect(d.allowed).toBe(false);
    expect(d.retryAfterSeconds).toBe(1);
  });
});

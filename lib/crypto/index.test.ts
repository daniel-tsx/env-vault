import { afterEach, describe, expect, test } from "vitest";
import { decrypt, encrypt, getPrimaryKeyId } from "./index";

const KEY_A = "a".repeat(64); // 32 bytes
const KEY_B = "b".repeat(64); // 32 bytes

const ORIGINAL_ENV = { ...process.env };

function setEnv(vars: Record<string, string | undefined>) {
  for (const key of ["ENCRYPTION_KEY", "ENCRYPTION_KEYS", "ENCRYPTION_PRIMARY_KEY_ID"]) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(vars)) {
    if (value !== undefined) process.env[key] = value;
  }
}

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("crypto", () => {
  test("round-trips with the legacy key as primary (id 0)", () => {
    setEnv({ ENCRYPTION_KEY: KEY_A });
    const enc = encrypt("super-secret");
    expect(enc.startsWith("0:")).toBe(true);
    expect(enc.split(":")).toHaveLength(4);
    expect(decrypt(enc)).toBe("super-secret");
    expect(getPrimaryKeyId()).toBe("0");
  });

  test("decrypts legacy 3-part ciphertext (no key id)", () => {
    setEnv({ ENCRYPTION_KEY: KEY_A });
    const legacy = encrypt("legacy-value").split(":").slice(1).join(":");
    expect(legacy.split(":")).toHaveLength(3);
    expect(decrypt(legacy)).toBe("legacy-value");
  });

  test("encrypts new values under the configured primary key id", () => {
    setEnv({
      ENCRYPTION_KEY: KEY_A,
      ENCRYPTION_KEYS: JSON.stringify({ "1": KEY_B }),
      ENCRYPTION_PRIMARY_KEY_ID: "1",
    });
    const enc = encrypt("rotated");
    expect(enc.startsWith("1:")).toBe(true);
    expect(getPrimaryKeyId()).toBe("1");
    expect(decrypt(enc)).toBe("rotated");
  });

  test("still decrypts non-primary keys during rotation overlap", () => {
    setEnv({ ENCRYPTION_KEY: KEY_A });
    const underKey0 = encrypt("old"); // "0:..."

    setEnv({
      ENCRYPTION_KEY: KEY_A,
      ENCRYPTION_KEYS: JSON.stringify({ "1": KEY_B }),
      ENCRYPTION_PRIMARY_KEY_ID: "1",
    });
    expect(decrypt(underKey0)).toBe("old");
    expect(encrypt("new").startsWith("1:")).toBe(true);
  });

  test("rejects tampered ciphertext (GCM auth failure)", () => {
    setEnv({ ENCRYPTION_KEY: KEY_A });
    const parts = encrypt("integrity").split(":");
    const ct = parts[3];
    parts[3] = ct.slice(0, -1) + (ct.slice(-1) === "0" ? "1" : "0");
    expect(() => decrypt(parts.join(":"))).toThrow();
  });

  test("throws clearly for an unknown key id", () => {
    setEnv({ ENCRYPTION_KEY: KEY_A });
    const parts = encrypt("x").split(":");
    parts[0] = "9";
    expect(() => decrypt(parts.join(":"))).toThrow(/Unknown encryption key id/);
  });

  test("rejects keys of the wrong length", () => {
    setEnv({ ENCRYPTION_KEY: "abcd" });
    expect(() => encrypt("x")).toThrow(/32 bytes/);
  });

  test("throws when no keys are configured", () => {
    setEnv({});
    expect(() => encrypt("x")).toThrow(/No encryption keys/);
  });

  test("rejects malformed ENCRYPTION_KEYS json", () => {
    setEnv({ ENCRYPTION_KEY: KEY_A, ENCRYPTION_KEYS: "not-json" });
    expect(() => encrypt("x")).toThrow(/valid JSON/);
  });
});

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// The original single-key deployments encrypted values with ENCRYPTION_KEY and
// stored them without a key id. That key is always exposed as key id "0" so
// legacy ciphertext keeps decrypting after key versioning is introduced.
const LEGACY_KEY_ID = "0";
const KEY_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

type KeyRing = {
  signature: string;
  keys: Map<string, Buffer>;
  primaryKeyId: string;
};

let cachedRing: KeyRing | null = null;

function parseHexKey(value: string, label: string): Buffer {
  const buffer = Buffer.from(value, "hex");
  if (buffer.length !== KEY_LENGTH) {
    throw new Error(
      `${label} must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`
    );
  }
  return buffer;
}

/**
 * Builds the set of available keys from the environment.
 *
 * - ENCRYPTION_KEY            -> key id "0" (the legacy/default key)
 * - ENCRYPTION_KEYS           -> optional JSON object of additional keys, e.g.
 *                                {"1":"<64 hex>","2":"<64 hex>"} used for rotation
 * - ENCRYPTION_PRIMARY_KEY_ID -> id of the key used for new writes (default "0")
 *
 * The result is memoized and only rebuilt when the relevant env vars change, so
 * tests can swap keys freely and bulk operations (rotation) avoid re-parsing.
 */
function loadKeyRing(): KeyRing {
  const rawKey = process.env.ENCRYPTION_KEY ?? "";
  const rawKeys = process.env.ENCRYPTION_KEYS ?? "";
  const rawPrimary = process.env.ENCRYPTION_PRIMARY_KEY_ID ?? "";
  const signature = `${rawKey}|${rawKeys}|${rawPrimary}`;

  if (cachedRing && cachedRing.signature === signature) {
    return cachedRing;
  }

  const keys = new Map<string, Buffer>();

  if (rawKeys) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawKeys);
    } catch {
      throw new Error(
        "ENCRYPTION_KEYS must be valid JSON (an object mapping keyId to a hex key)"
      );
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("ENCRYPTION_KEYS must be a JSON object mapping keyId to a hex key");
    }
    for (const [id, hex] of Object.entries(parsed as Record<string, unknown>)) {
      if (!KEY_ID_PATTERN.test(id)) {
        throw new Error(
          `Invalid encryption key id "${id}" (allowed: letters, numbers, "_" and "-")`
        );
      }
      if (typeof hex !== "string") {
        throw new Error(`Encryption key "${id}" must be a hex string`);
      }
      keys.set(id, parseHexKey(hex, `Encryption key "${id}"`));
    }
  }

  if (rawKey && !keys.has(LEGACY_KEY_ID)) {
    keys.set(LEGACY_KEY_ID, parseHexKey(rawKey, "ENCRYPTION_KEY"));
  }

  if (keys.size === 0) {
    throw new Error(
      "No encryption keys configured. Set ENCRYPTION_KEY (or ENCRYPTION_KEYS)."
    );
  }

  const primaryKeyId = rawPrimary || LEGACY_KEY_ID;
  if (!keys.has(primaryKeyId)) {
    throw new Error(
      `ENCRYPTION_PRIMARY_KEY_ID "${primaryKeyId}" has no matching key`
    );
  }

  cachedRing = { signature, keys, primaryKeyId };
  return cachedRing;
}

/** The key id new values are encrypted under (used by the rotation script). */
export function getPrimaryKeyId(): string {
  return loadKeyRing().primaryKeyId;
}

export function encrypt(plaintext: string): string {
  const { keys, primaryKeyId } = loadKeyRing();
  const key = keys.get(primaryKeyId)!;
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${primaryKeyId}:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const { keys } = loadKeyRing();
  const parts = encryptedData.split(":");

  let keyId: string;
  let ivHex: string;
  let authTagHex: string;
  let ciphertext: string;

  if (parts.length === 4) {
    [keyId, ivHex, authTagHex, ciphertext] = parts;
  } else if (parts.length === 3) {
    // Legacy format (pre key-versioning): iv:authTag:ciphertext under ENCRYPTION_KEY.
    keyId = LEGACY_KEY_ID;
    [ivHex, authTagHex, ciphertext] = parts;
  } else {
    throw new Error("Invalid encrypted data format");
  }

  const key = keys.get(keyId);
  if (!key) {
    throw new Error(`Unknown encryption key id "${keyId}"`);
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  if (iv.length !== IV_LENGTH) {
    throw new Error("Invalid IV length");
  }
  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid auth tag length");
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

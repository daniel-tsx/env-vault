# Security Model

**Status: current.** Describes how EnvVault protects secrets as of the
harden-and-expand upgrade.

## Threat model & honest scope

EnvVault encrypts secret values at rest with a key held by the server. It is
**not zero-knowledge** — the server can decrypt values (this is required for
reveal, copy, `.env` export, and the rotation script). Protection focuses on:
encryption at rest, strict per-user access control, and limiting how easily a
live or hijacked session can exfiltrate secrets.

## Encryption

- **Algorithm:** AES-256-GCM (authenticated) with a random 12-byte IV and
  16-byte auth tag per value.
- **Storage format:** `keyId:iv:authTag:ciphertext` (hex). Legacy values written
  before key versioning use the 3-part `iv:authTag:ciphertext` form and decrypt
  under key id `0` (the original `ENCRYPTION_KEY`).
- **Implementation:** [`lib/crypto/index.ts`](../lib/crypto/index.ts), unit
  tested in `lib/crypto/index.test.ts`.

### Key rotation

- Configure keys via `ENCRYPTION_KEY` (id `0`), optional `ENCRYPTION_KEYS`
  (JSON of `id -> hex`), and `ENCRYPTION_PRIMARY_KEY_ID` (default `0`).
- New writes use the primary key; all configured keys can still decrypt.
- `pnpm rotate-keys` re-encrypts every stored value to the primary key
  (dry-run by default; `--apply` to write). Back up the database first.

## Access control

Every server action verifies the session and re-checks that the resource belongs
to the user before acting (`lib/ownership.ts`). Database errors are mapped to safe
messages (`lib/db/errors.ts`) so driver details never reach the client.

## Reveal protection

- **Step-up re-auth:** revealing, copying, or exporting a secret requires a
  recent password re-entry. This issues a short-lived (5 min), httpOnly,
  HMAC-signed, session-bound grant cookie (`lib/step-up.ts`).
- **Rate limiting:** the reveal action is limited per user (30/60s) and export
  (10/60s) via a DB-backed limiter (`lib/rate-limit.ts`); BetterAuth rate-limits
  auth endpoints (stricter on sign-in/up) using database storage.
- **Auto-hide:** revealed values clear from the UI after 30 seconds.

## Authentication

- Email + password via BetterAuth; optional **TOTP two-factor** (authenticator
  app + one-time backup codes), challenged at sign-in.
- Sessions: 7-day expiry, refreshed daily.

## Audit logging

Secret access (reveal/export) and all mutations, plus sign-in and step-up, are
recorded in `audit_log` (`lib/audit.ts`) with action, resource, a non-secret
label, IP, and user agent. **Secret values are never logged.** Recent activity is
shown on the settings page.

## Variable history

Updates and deletions snapshot the prior (already-encrypted) value into
`variable_versions`, enabling history view and restore. Revealing a historical
value is gated by step-up, like any reveal.

## Operational notes

- Apply database migrations (`pnpm db:migrate`, or `pnpm db:push` in dev) so the
  `audit_log`, rate-limit, `two_factor`, and `variable_versions` tables exist.
  Audit logging and the custom rate limiter fail safe (open) if their tables are
  missing; **2FA and step-up require their tables to function.**
- Use strong, unique `BETTER_AUTH_SECRET` and `ENCRYPTION_KEY`, HTTPS in
  production, and regular database backups.

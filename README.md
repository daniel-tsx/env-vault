# EnvVault

A secure environment variable manager for developers who work on multiple projects.

## Features

- **Multi-project support** — organize variables across all your projects
- **AES-256-GCM encryption** with **zero-downtime key rotation**
- **Environment groups** — separate development, staging, and production
- **Secure by default** — values masked in the UI, revealed only on demand
- **Step-up re-authentication** before revealing, copying, or exporting secrets
- **Two-factor authentication** (TOTP + backup codes)
- **Rate limiting** on reveal/export and auth endpoints
- **Audit log** of secret access and changes
- **Variable history** with reveal and restore
- **Bulk `.env` import/export**
- **Global search** across all projects (`Cmd/Ctrl+K`)
- **Account settings** — profile, password, 2FA, recent activity, delete account
- **Light & dark themes**

## Tech Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui on Base UI · next-themes
- Drizzle ORM · Neon Postgres
- BetterAuth (email/password + two-factor) · Zod
- Vitest (unit tests for crypto, rate limiting, step-up, `.env` parsing)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- A Neon Postgres database ([neon.tech](https://neon.tech))

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create `.env.local` from the example and fill it in:
   ```bash
   cp .env.example .env.local
   ```
   ```env
   DATABASE_URL=postgresql://...
   BETTER_AUTH_SECRET=...      # openssl rand -hex 32
   BETTER_AUTH_URL=http://localhost:3000
   ENCRYPTION_KEY=...          # openssl rand -hex 32 (32 bytes), used as key id "0"
   ```
3. Apply the database schema:
   ```bash
   pnpm db:migrate   # or `pnpm db:push` for quick dev iteration
   ```
4. Run the dev server:
   ```bash
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
env-vault/
├── app/
│   ├── (dashboard)/            # Protected: projects, settings (+ loading/error)
│   ├── sign-in, sign-up, two-factor
│   ├── api/auth/[...all]
│   └── layout.tsx, page.tsx, globals.css
├── components/                 # ThemeProvider, ThemeToggle, ui/* (shadcn/Base UI)
├── db/
│   ├── schema.ts               # Drizzle schema
│   └── migrations/             # Generated SQL migrations
├── features/                   # auth, account, projects, environments, variables, search
├── lib/
│   ├── auth/                   # BetterAuth config, session, client, password verify
│   ├── crypto/                 # AES-256-GCM with key versioning (+ tests)
│   ├── audit.ts, rate-limit.ts, step-up.ts, ownership.ts, env-file.ts, sql.ts
│   └── db/errors.ts            # safe DB error mapping
├── scripts/rotate-keys.ts      # re-encrypt all values to the primary key
└── proxy.ts                    # auth redirect (Next 16 proxy convention)
```

## Security

See [`docs/SECURITY.md`](docs/SECURITY.md) for the full model. Highlights:

- **Not zero-knowledge:** values are encrypted at rest with a server-held key
  (required for reveal/export/CLI). Integrity is guaranteed by GCM auth tags.
- **Key rotation:** ciphertext is `keyId:iv:authTag:ciphertext`; add a new key to
  `ENCRYPTION_KEYS`, set `ENCRYPTION_PRIMARY_KEY_ID`, then run
  `pnpm rotate-keys --apply`. Legacy un-versioned values keep decrypting.
- **Access control:** every action re-verifies session and ownership; DB errors
  are mapped to safe messages.
- **Reveal protection:** step-up re-auth + rate limiting + 30s auto-hide.
- **2FA:** optional TOTP with backup codes, challenged at sign-in.
- **Audit log:** every reveal/export/mutation recorded (never the values).

## Commands

```bash
pnpm dev | build | start
pnpm lint | typecheck | test
pnpm db:generate   # generate a migration from schema changes
pnpm db:migrate    # apply migrations
pnpm db:push       # push schema directly (dev)
pnpm db:studio     # Drizzle Studio
pnpm rotate-keys [--apply]   # re-encrypt values to the primary key
```

## Deployment

Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (HTTPS),
`ENCRYPTION_KEY` (and, if rotating, `ENCRYPTION_KEYS` / `ENCRYPTION_PRIMARY_KEY_ID`)
in your platform. Apply migrations on deploy. For Vercel: import the repo, add
the env vars, deploy.

## Security Best Practices

1. Never commit `.env.local` (already git-ignored).
2. Use strong, unique `BETTER_AUTH_SECRET` and `ENCRYPTION_KEY`.
3. Rotate the encryption key periodically (`pnpm rotate-keys`).
4. Use HTTPS in production.
5. Review recent activity (Settings) and back up your database.

## Future Enhancements

- [ ] Team/workspace support with RBAC
- [ ] CLI tool for syncing variables in CI/CD
- [ ] API access with scoped tokens
- [ ] Webhook notifications for secret access

## License

MIT

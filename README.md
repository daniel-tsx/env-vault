# EnvVault

A secure environment variable manager for developers who work on multiple projects.

## Features

- **Multi-project support**: Organize variables across all your projects
- **AES-256-GCM encryption**: All secrets are encrypted at rest
- **Environment groups**: Separate development, staging, and production variables
- **Secure by default**: Values are masked in the UI, revealed only on demand
- **Fast search**: Find any variable instantly
- **One-click copy**: Copy values securely after reveal

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Neon Postgres
- BetterAuth
- Zod

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- A Neon Postgres database (free tier available at [neon.tech](https://neon.tech))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd env-vault
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:

```env
# Database - Get from neon.tech
DATABASE_URL=postgresql://...

# Generate with: openssl rand -hex 32
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=your-encryption-key-here
```

**Generating secure keys:**

```bash
# On macOS/Linux
openssl rand -hex 32

# On Windows (PowerShell)
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })

# Or use an online generator (use at your own risk)
```

5. Push the database schema:
```bash
pnpm db:push
```

6. Run the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
env-vault/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/              # Protected dashboard pages
│   │   └── projects/
│   ├── api/auth/                 # BetterAuth API routes
│   └── layout.tsx
├── components/                   # Shared UI components
├── db/
│   ├── schema.ts                 # Drizzle schema definitions
│   └── index.ts                  # Database client
├── features/
│   ├── projects/                 # Project-related actions & components
│   ├── environments/             # Environment-related actions & components
│   └── variables/                # Variable-related actions & components
├── lib/
│   ├── auth/                     # BetterAuth configuration
│   ├── crypto/                   # Encryption/decryption utilities
│   ├── validators/               # Zod validation schemas
│   └── utils.ts                  # Utility functions
└── middleware.ts                 # Route protection middleware
```

## Security

### Encryption

All environment variable values are encrypted using **AES-256-GCM** before being stored in the database:

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key**: 32-byte key from `ENCRYPTION_KEY` environment variable
- **IV**: Random 12-byte initialization vector per value
- **Auth Tag**: 16-byte authentication tag for integrity verification
- **Storage format**: `iv:authTag:ciphertext` (all hex-encoded)

### Secret Reveal Flow

1. User clicks "Reveal" button
2. Server action verifies session and ownership
3. Value is decrypted server-side
4. Decrypted value is sent to client
5. Value is displayed temporarily and can be hidden again

### Ownership Enforcement

Every server action and query follows this pattern:
1. Verify user session
2. Load resource
3. Verify resource belongs to user
4. Proceed with operation

This ensures users can only access their own projects, environments, and variables.

## Database Commands

```bash
# Generate migrations (not used with db:push, but available)
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## Deployment

### Environment Variables

Make sure to set all required environment variables in your deployment platform:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (your production URL)
- `ENCRYPTION_KEY`

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Follow your platform's deployment guide for Next.js apps. Ensure all environment variables are configured.

## Security Best Practices

1. **Never commit `.env.local`** - it's already in `.gitignore`
2. **Use strong, unique keys** for `BETTER_AUTH_SECRET` and `ENCRYPTION_KEY`
3. **Rotate encryption keys** periodically (requires re-encrypting all values)
4. **Use HTTPS in production** - set `BETTER_AUTH_URL` to your HTTPS URL
5. **Review access logs** - monitor for unauthorized access attempts
6. **Backup your database** - encrypted data is only as safe as your backups

## Future Enhancements

- [ ] Team/workspace support
- [ ] Variable sharing between team members
- [ ] Audit logs for all actions
- [ ] Bulk import/export (encrypted)
- [ ] CLI tool for syncing variables
- [ ] API access with scoped tokens
- [ ] Variable versioning/history
- [ ] Integration with CI/CD platforms

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

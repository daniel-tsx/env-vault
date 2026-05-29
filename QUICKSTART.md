# Quick Start Guide

## Setup Checklist

### 1. Generate Secure Keys

You need two secure random values:

**BETTER_AUTH_SECRET** (for session management):
```bash
# macOS/Linux
openssl rand -hex 32

# Windows PowerShell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```

**ENCRYPTION_KEY** (for encrypting secrets):
```bash
# Same command as above
openssl rand -hex 32
```

### 2. Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)

### 3. Configure Environment Variables

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
BETTER_AUTH_SECRET=<your-generated-secret>
BETTER_AUTH_URL=http://localhost:3000
ENCRYPTION_KEY=<your-generated-encryption-key>
```

### 4. Initialize Database

```bash
pnpm db:push
```

This creates all the required tables in your Neon database.

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Create Your Account

1. Click "Get started" or navigate to `/sign-up`
2. Enter your name, email, and password
3. You'll be redirected to the dashboard

## Using EnvVault

### Create a Project

1. Click "New project" button
2. Enter project name and optional description
3. Click "Create"

### Add Environments

1. Open a project
2. Click "Add environment"
3. Enter environment name (e.g., "Production", "Development")
4. Click "Create"

### Add Variables

1. In an environment section, click "Add variable"
2. Enter:
   - **Key**: Variable name (auto-uppercased, e.g., `API_KEY`)
   - **Value**: The secret value
   - **Description**: Optional note about what it's for
3. Click "Add"

### View & Copy Secrets

1. Click the eye icon to reveal a value
2. Click the copy icon to copy the value to clipboard
3. Click the eye icon again to hide the value

### Search

- Use the search box on the projects page to filter projects
- Variable search is available within each environment

## Security Notes

- All secret values are encrypted with AES-256-GCM before storage
- Values are only decrypted when you explicitly reveal them
- Each user can only access their own projects and variables
- Sessions expire after 7 days of inactivity
- Never share your `ENCRYPTION_KEY` - if compromised, all secrets must be re-encrypted

## Troubleshooting

### Build fails with "DATABASE_URL not set"

Make sure `.env.local` exists and has a valid `DATABASE_URL`.

### "BETTER_AUTH_SECRET" warning during build

This is normal during build. The warning appears because the secret isn't available at build time, but it will work at runtime.

### Cannot connect to database

1. Verify your `DATABASE_URL` is correct
2. Check that your Neon database is running
3. Ensure your IP is allowed (Neon may have IP restrictions)

### Encryption errors

Make sure `ENCRYPTION_KEY` is exactly 64 hex characters (32 bytes).

## Next Steps

- Add more environments (staging, testing, etc.)
- Organize variables by category using descriptions
- Use the search feature to find variables quickly
- Consider setting up team access (future feature)

## Production Deployment

When deploying to production:

1. Set `BETTER_AUTH_URL` to your production HTTPS URL
2. Use strong, unique secrets (not the same as development)
3. Enable HTTPS on your domain
4. Set up database backups
5. Consider using environment variable management in your hosting platform

## Support

For issues or questions:
- Check the main README.md
- Review the security section for best practices
- Open an issue on GitHub

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { twoFactor } from "better-auth/plugins";
import { db } from "@/db";
import { logAudit } from "@/lib/audit";

export const auth = betterAuth({
  appName: "EnvVault",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [twoFactor()],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  // Rate limiting is active in production by default (off in dev). Database
  // storage keeps counters consistent across serverless instances.
  rateLimit: {
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await logAudit({
            userId: session.userId,
            action: "auth.sign_in",
            ipAddress: session.ipAddress ?? null,
            userAgent: session.userAgent ?? null,
          });
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

// Verifies a user's password against their stored credential hash without
// creating or rotating a session — used for step-up re-authentication.
export async function verifyUserPassword(
  userId: string,
  password: string
): Promise<boolean> {
  try {
    const ctx = await auth.$context;
    const accounts = await ctx.internalAdapter.findAccounts(userId);
    const credential = accounts?.find(
      (account) => account.providerId === "credential"
    );
    if (!credential?.password) return false;
    return await ctx.password.verify({
      hash: credential.password,
      password,
    });
  } catch {
    return false;
  }
}

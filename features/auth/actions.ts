"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, verifyUserPassword } from "@/lib/auth";
import { requireSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import {
  checkRateLimit,
  STEP_UP_LIMIT,
  STEP_UP_WINDOW_SECONDS,
} from "@/lib/rate-limit";
import { clearRevealGrant, issueRevealGrant } from "@/lib/step-up";

export async function signOut() {
  await clearRevealGrant();
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/sign-in");
}

export type StepUpResult = { ok: true } | { ok: false; message: string };

// Re-authenticates the current user (password) and issues a short-lived reveal
// grant. Required before secrets can be revealed or exported.
export async function verifyStepUp(input: {
  password: string;
}): Promise<StepUpResult> {
  const session = await requireSession();

  const limit = await checkRateLimit(
    `stepup:${session.user.id}`,
    STEP_UP_LIMIT,
    STEP_UP_WINDOW_SECONDS
  );
  if (!limit.allowed) {
    return {
      ok: false,
      message: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  const valid = await verifyUserPassword(session.user.id, input.password);
  if (!valid) {
    return { ok: false, message: "Incorrect password." };
  }

  await issueRevealGrant(session.session.id);
  await logAudit({ userId: session.user.id, action: "auth.step_up" });
  return { ok: true };
}

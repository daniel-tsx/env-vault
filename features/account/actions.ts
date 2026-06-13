"use server";

import { db } from "@/db";
import { auditLog, user } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { verifyUserPassword } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const nameSchema = z.string().min(1, "Name is required").max(100);

export async function updateProfile(input: { name: string }) {
  const session = await requireSession();
  const name = nameSchema.parse(input.name);

  await db
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  revalidatePath("/settings");
}

export async function getRecentActivity() {
  const session = await requireSession();
  try {
    return await db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        label: auditLog.label,
        ipAddress: auditLog.ipAddress,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .where(eq(auditLog.userId, session.user.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(25);
  } catch {
    // audit_log may not be migrated yet; show an empty feed rather than erroring.
    return [];
  }
}

export type DeleteAccountResult = { ok: true } | { ok: false; message: string };

export async function deleteAccount(input: {
  password: string;
}): Promise<DeleteAccountResult> {
  const session = await requireSession();

  const valid = await verifyUserPassword(session.user.id, input.password);
  if (!valid) {
    return { ok: false, message: "Incorrect password." };
  }

  // Cascade FKs remove sessions, accounts, 2FA, projects, environments,
  // variables, audit log, and version history.
  await db.delete(user).where(eq(user.id, session.user.id));

  return { ok: true };
}

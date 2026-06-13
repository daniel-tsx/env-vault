import { headers } from "next/headers";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { nanoid } from "nanoid";

export type AuditAction =
  | "auth.sign_in"
  | "auth.step_up"
  | "project.create"
  | "project.update"
  | "project.delete"
  | "environment.create"
  | "environment.update"
  | "environment.delete"
  | "variable.create"
  | "variable.update"
  | "variable.delete"
  | "variable.reveal"
  | "variable.export";

type LogAuditInput = {
  userId: string;
  action: AuditAction;
  resourceType?: "project" | "environment" | "variable";
  resourceId?: string;
  /** Non-secret, human-readable descriptor (variable key, project/env name). */
  label?: string;
  /** Provide explicitly from contexts where next/headers is unavailable. */
  ipAddress?: string | null;
  userAgent?: string | null;
};

/**
 * Records an audit event. Best-effort: failures (including a missing table or
 * request scope) are swallowed so logging can never break the primary action.
 */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    let ipAddress = input.ipAddress ?? null;
    let userAgent = input.userAgent ?? null;

    if (input.ipAddress === undefined || input.userAgent === undefined) {
      try {
        const requestHeaders = await headers();
        if (input.ipAddress === undefined) {
          ipAddress =
            requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            requestHeaders.get("x-real-ip") ??
            null;
        }
        if (input.userAgent === undefined) {
          userAgent = requestHeaders.get("user-agent") ?? null;
        }
      } catch {
        // headers() is unavailable outside a request scope; leave as null.
      }
    }

    await db.insert(auditLog).values({
      id: nanoid(),
      userId: input.userId,
      action: input.action,
      resourceType: input.resourceType ?? null,
      resourceId: input.resourceId ?? null,
      label: input.label ?? null,
      ipAddress,
      userAgent,
    });
  } catch {
    // Intentionally ignored — auditing is non-critical to the request.
  }
}

"use server";

import { db } from "@/db";
import { environmentVariables, variableVersions, projects } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { encrypt, decrypt } from "@/lib/crypto";
import { mapDbError } from "@/lib/db/errors";
import {
  checkRateLimit,
  REVEAL_LIMIT,
  REVEAL_WINDOW_SECONDS,
  EXPORT_LIMIT,
  EXPORT_WINDOW_SECONDS,
} from "@/lib/rate-limit";
import { hasValidRevealGrant } from "@/lib/step-up";
import { parseEnv, serializeEnv } from "@/lib/env-file";
import {
  verifyEnvironmentOwnership,
  verifyProjectOwnership,
  verifyVariableOwnership,
} from "@/lib/ownership";
import {
  createVariableSchema,
  updateVariableSchema,
} from "@/lib/validators/variable";
import { and, desc, eq, ilike } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type {
  CreateVariableInput,
  UpdateVariableInput,
} from "@/lib/validators/variable";

const variableColumns = {
  id: environmentVariables.id,
  key: environmentVariables.key,
  description: environmentVariables.description,
  createdAt: environmentVariables.createdAt,
  updatedAt: environmentVariables.updatedAt,
};

function escapeLike(value: string) {
  return value.replace(/[%_\\]/g, "\\$&");
}

type VariableRow = typeof environmentVariables.$inferSelect;

// Records a point-in-time snapshot of a variable (the already-encrypted value is
// stored verbatim — no decrypt/re-encrypt needed). Best-effort: history is
// supplementary, so a snapshot failure (e.g. variable_versions not yet migrated)
// must never break the edit/delete/restore it accompanies.
async function snapshotVariable(
  variable: Pick<
    VariableRow,
    "id" | "projectId" | "environmentId" | "key" | "encryptedValue" | "description"
  >,
  action: "update" | "delete" | "restore"
) {
  try {
    await db.insert(variableVersions).values({
      id: nanoid(),
      variableId: variable.id,
      projectId: variable.projectId,
      environmentId: variable.environmentId,
      key: variable.key,
      encryptedValue: variable.encryptedValue,
      description: variable.description ?? null,
      action,
    });
  } catch {
    // Intentionally ignored — see note above.
  }
}

export async function getVariables(environmentId: string, search?: string) {
  const session = await requireSession();
  await verifyEnvironmentOwnership(environmentId, session.user.id);

  const conditions = [eq(environmentVariables.environmentId, environmentId)];
  if (search) {
    conditions.push(ilike(environmentVariables.key, `%${escapeLike(search)}%`));
  }

  return db
    .select(variableColumns)
    .from(environmentVariables)
    .where(and(...conditions))
    .orderBy(environmentVariables.key);
}

// Loads every variable for a project in a single query (ownership checked once),
// so the project page can group by environment in memory instead of issuing one
// query per environment.
export async function getVariablesForProject(projectId: string) {
  const session = await requireSession();
  await verifyProjectOwnership(projectId, session.user.id);

  return db
    .select({
      ...variableColumns,
      environmentId: environmentVariables.environmentId,
    })
    .from(environmentVariables)
    .where(eq(environmentVariables.projectId, projectId))
    .orderBy(environmentVariables.key);
}

export type RevealResult =
  | { status: "ok"; id: string; value: string }
  | { status: "step_up_required" }
  | { status: "rate_limited"; retryAfterSeconds: number };

export async function revealVariable(id: string): Promise<RevealResult> {
  const session = await requireSession();

  // Step-up first (cheap cookie check) so prompts don't consume reveal budget.
  if (!(await hasValidRevealGrant(session.session.id))) {
    return { status: "step_up_required" };
  }

  const limit = await checkRateLimit(
    `reveal:${session.user.id}`,
    REVEAL_LIMIT,
    REVEAL_WINDOW_SECONDS
  );
  if (!limit.allowed) {
    return { status: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds };
  }

  const variable = await verifyVariableOwnership(id, session.user.id);
  const decryptedValue = decrypt(variable.environment_variables.encryptedValue);

  await logAudit({
    userId: session.user.id,
    action: "variable.reveal",
    resourceType: "variable",
    resourceId: variable.environment_variables.id,
    label: variable.environment_variables.key,
  });

  return {
    status: "ok",
    id: variable.environment_variables.id,
    value: decryptedValue,
  };
}

export async function createVariable(input: CreateVariableInput) {
  const session = await requireSession();
  const environment = await verifyEnvironmentOwnership(
    input.environmentId,
    session.user.id
  );

  const validated = createVariableSchema.parse(input);
  const encryptedValue = encrypt(validated.value);

  let inserted;
  try {
    inserted = await db
      .insert(environmentVariables)
      .values({
        id: nanoid(),
        projectId: environment.projects.id,
        environmentId: validated.environmentId,
        key: validated.key,
        encryptedValue,
        description: validated.description || null,
      })
      .returning();
  } catch (error) {
    throw mapDbError(error);
  }

  revalidatePath(`/projects/${environment.projects.id}`);
  await logAudit({
    userId: session.user.id,
    action: "variable.create",
    resourceType: "variable",
    resourceId: inserted[0].id,
    label: validated.key,
  });
  return inserted[0];
}

export async function updateVariable(id: string, input: UpdateVariableInput) {
  const session = await requireSession();
  const existing = await verifyVariableOwnership(id, session.user.id);

  const validated = updateVariableSchema.parse(input);

  // Snapshot the pre-update state for history.
  await snapshotVariable(existing.environment_variables, "update");

  const updates: Partial<typeof environmentVariables.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (validated.key) {
    updates.key = validated.key;
  }
  if (validated.value) {
    updates.encryptedValue = encrypt(validated.value);
  }
  if (validated.description !== undefined) {
    updates.description = validated.description || null;
  }

  let updated;
  try {
    updated = await db
      .update(environmentVariables)
      .set(updates)
      .where(eq(environmentVariables.id, id))
      .returning();
  } catch (error) {
    throw mapDbError(error);
  }

  revalidatePath(`/projects/${existing.projects.id}`);
  await logAudit({
    userId: session.user.id,
    action: "variable.update",
    resourceType: "variable",
    resourceId: id,
    label: updated[0].key,
  });
  return updated[0];
}

export async function deleteVariable(id: string) {
  const session = await requireSession();
  const existing = await verifyVariableOwnership(id, session.user.id);

  // Snapshot the final state before deletion so history is retained.
  await snapshotVariable(existing.environment_variables, "delete");

  await db.delete(environmentVariables).where(eq(environmentVariables.id, id));

  revalidatePath(`/projects/${existing.projects.id}`);
  await logAudit({
    userId: session.user.id,
    action: "variable.delete",
    resourceType: "variable",
    resourceId: id,
    label: existing.environment_variables.key,
  });
}

const KEY_PATTERN = /^[A-Z0-9_]+$/;

export type ImportResult = {
  created: number;
  updated: number;
  skipped: number;
  invalid: string[];
};

export async function importVariables(
  environmentId: string,
  content: string,
  mode: "skip" | "overwrite"
): Promise<ImportResult> {
  const session = await requireSession();
  const environment = await verifyEnvironmentOwnership(
    environmentId,
    session.user.id
  );

  const entries = parseEnv(content);

  const existingRows = await db
    .select({
      id: environmentVariables.id,
      key: environmentVariables.key,
      encryptedValue: environmentVariables.encryptedValue,
      description: environmentVariables.description,
      projectId: environmentVariables.projectId,
      environmentId: environmentVariables.environmentId,
    })
    .from(environmentVariables)
    .where(eq(environmentVariables.environmentId, environmentId));
  const existingByKey = new Map(existingRows.map((row) => [row.key, row]));

  const toInsert: (typeof environmentVariables.$inferInsert)[] = [];
  const invalid: string[] = [];
  let updated = 0;
  let skipped = 0;

  try {
    for (const entry of entries) {
      if (!KEY_PATTERN.test(entry.key)) {
        invalid.push(entry.key);
        continue;
      }
      const existing = existingByKey.get(entry.key);
      if (existing) {
        if (mode === "skip") {
          skipped++;
          continue;
        }
        // Snapshot the prior value so bulk overwrite records history too.
        await snapshotVariable(existing, "update");
        await db
          .update(environmentVariables)
          .set({ encryptedValue: encrypt(entry.value), updatedAt: new Date() })
          .where(eq(environmentVariables.id, existing.id));
        updated++;
      } else {
        toInsert.push({
          id: nanoid(),
          projectId: environment.projects.id,
          environmentId,
          key: entry.key,
          encryptedValue: encrypt(entry.value),
          description: null,
        });
      }
    }

    if (toInsert.length > 0) {
      await db.insert(environmentVariables).values(toInsert);
    }
  } catch (error) {
    throw mapDbError(error);
  }

  revalidatePath(`/projects/${environment.projects.id}`);
  await logAudit({
    userId: session.user.id,
    action: "variable.import",
    resourceType: "environment",
    resourceId: environmentId,
    label: `${toInsert.length} created, ${updated} updated`,
  });

  return { created: toInsert.length, updated, skipped, invalid };
}

export type ExportResult =
  | { status: "ok"; filename: string; content: string }
  | { status: "step_up_required" }
  | { status: "rate_limited"; retryAfterSeconds: number };

export async function exportEnvironment(
  environmentId: string
): Promise<ExportResult> {
  const session = await requireSession();

  if (!(await hasValidRevealGrant(session.session.id))) {
    return { status: "step_up_required" };
  }

  const limit = await checkRateLimit(
    `export:${session.user.id}`,
    EXPORT_LIMIT,
    EXPORT_WINDOW_SECONDS
  );
  if (!limit.allowed) {
    return { status: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds };
  }

  const environment = await verifyEnvironmentOwnership(
    environmentId,
    session.user.id
  );

  const rows = await db
    .select({
      key: environmentVariables.key,
      encryptedValue: environmentVariables.encryptedValue,
    })
    .from(environmentVariables)
    .where(eq(environmentVariables.environmentId, environmentId))
    .orderBy(environmentVariables.key);

  const content = serializeEnv(
    rows.map((row) => ({ key: row.key, value: decrypt(row.encryptedValue) }))
  );

  await logAudit({
    userId: session.user.id,
    action: "variable.export",
    resourceType: "environment",
    resourceId: environmentId,
    label: environment.environments.name,
  });

  return {
    status: "ok",
    filename: `${environment.environments.slug || "environment"}.env`,
    content,
  };
}

export async function getVariableHistory(variableId: string) {
  const session = await requireSession();
  await verifyVariableOwnership(variableId, session.user.id);

  return db
    .select({
      id: variableVersions.id,
      action: variableVersions.action,
      key: variableVersions.key,
      description: variableVersions.description,
      createdAt: variableVersions.createdAt,
    })
    .from(variableVersions)
    .where(eq(variableVersions.variableId, variableId))
    .orderBy(desc(variableVersions.createdAt));
}

export async function revealVersion(versionId: string): Promise<RevealResult> {
  const session = await requireSession();

  if (!(await hasValidRevealGrant(session.session.id))) {
    return { status: "step_up_required" };
  }

  const limit = await checkRateLimit(
    `reveal:${session.user.id}`,
    REVEAL_LIMIT,
    REVEAL_WINDOW_SECONDS
  );
  if (!limit.allowed) {
    return { status: "rate_limited", retryAfterSeconds: limit.retryAfterSeconds };
  }

  const [row] = await db
    .select({
      id: variableVersions.id,
      key: variableVersions.key,
      encryptedValue: variableVersions.encryptedValue,
    })
    .from(variableVersions)
    .innerJoin(projects, eq(variableVersions.projectId, projects.id))
    .where(
      and(eq(variableVersions.id, versionId), eq(projects.userId, session.user.id))
    )
    .limit(1);

  if (!row) {
    throw new Error("Version not found");
  }

  const value = decrypt(row.encryptedValue);

  await logAudit({
    userId: session.user.id,
    action: "variable.reveal",
    resourceType: "variable",
    resourceId: row.id,
    label: `${row.key} (history)`,
  });

  return { status: "ok", id: row.id, value };
}

export async function restoreVariableVersion(versionId: string) {
  const session = await requireSession();

  const [version] = await db
    .select()
    .from(variableVersions)
    .innerJoin(projects, eq(variableVersions.projectId, projects.id))
    .where(
      and(eq(variableVersions.id, versionId), eq(projects.userId, session.user.id))
    )
    .limit(1);

  if (!version) {
    throw new Error("Version not found");
  }

  const snapshot = version.variable_versions;
  const current = await verifyVariableOwnership(
    snapshot.variableId,
    session.user.id
  );

  // Snapshot the current state first so a restore is itself undoable.
  await snapshotVariable(current.environment_variables, "restore");

  await db
    .update(environmentVariables)
    .set({
      encryptedValue: snapshot.encryptedValue,
      description: snapshot.description,
      updatedAt: new Date(),
    })
    .where(eq(environmentVariables.id, snapshot.variableId));

  revalidatePath(`/projects/${snapshot.projectId}`);
  await logAudit({
    userId: session.user.id,
    action: "variable.update",
    resourceType: "variable",
    resourceId: snapshot.variableId,
    label: `${current.environment_variables.key} (restored)`,
  });
}

"use server";

import { db } from "@/db";
import { environmentVariables } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { encrypt, decrypt } from "@/lib/crypto";
import { mapDbError } from "@/lib/db/errors";
import {
  verifyEnvironmentOwnership,
  verifyProjectOwnership,
  verifyVariableOwnership,
} from "@/lib/ownership";
import {
  createVariableSchema,
  updateVariableSchema,
} from "@/lib/validators/variable";
import { and, eq, ilike } from "drizzle-orm";
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

export async function revealVariable(id: string) {
  const session = await requireSession();
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

"use server";

import { db } from "@/db";
import { environmentVariables, environments, projects } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { encrypt, decrypt } from "@/lib/crypto";
import {
  createVariableSchema,
  updateVariableSchema,
} from "@/lib/validators/variable";
import { eq, and, like } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type {
  CreateVariableInput,
  UpdateVariableInput,
} from "@/lib/validators/variable";

async function verifyEnvironmentOwnership(
  environmentId: string,
  userId: string
) {
  const [environment] = await db
    .select()
    .from(environments)
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(
      and(
        eq(environments.id, environmentId),
        eq(projects.userId, userId)
      )
    )
    .limit(1);

  if (!environment) {
    throw new Error("Environment not found");
  }

  return environment;
}

async function verifyVariableOwnership(id: string, userId: string) {
  const [variable] = await db
    .select()
    .from(environmentVariables)
    .innerJoin(
      environments,
      eq(environmentVariables.environmentId, environments.id)
    )
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(
      and(
        eq(environmentVariables.id, id),
        eq(projects.userId, userId)
      )
    )
    .limit(1);

  if (!variable) {
    throw new Error("Variable not found");
  }

  return variable;
}

export async function getVariables(environmentId: string, search?: string) {
  const session = await requireSession();
  await verifyEnvironmentOwnership(environmentId, session.user.id);

  let query = db
    .select({
      id: environmentVariables.id,
      key: environmentVariables.key,
      description: environmentVariables.description,
      createdAt: environmentVariables.createdAt,
      updatedAt: environmentVariables.updatedAt,
    })
    .from(environmentVariables)
    .where(eq(environmentVariables.environmentId, environmentId))
    .orderBy(environmentVariables.key);

  if (search) {
    query = db
      .select({
        id: environmentVariables.id,
        key: environmentVariables.key,
        description: environmentVariables.description,
        createdAt: environmentVariables.createdAt,
        updatedAt: environmentVariables.updatedAt,
      })
      .from(environmentVariables)
      .where(
        and(
          eq(environmentVariables.environmentId, environmentId),
          like(environmentVariables.key, `%${search}%`)
        )
      )
      .orderBy(environmentVariables.key);
  }

  return await query;
}

export async function revealVariable(id: string) {
  const session = await requireSession();
  const variable = await verifyVariableOwnership(id, session.user.id);

  const decryptedValue = decrypt(variable.environment_variables.encryptedValue);

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

  const [variable] = await db
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

  revalidatePath(`/projects/${environment.projects.id}`);
  return variable;
}

export async function updateVariable(id: string, input: UpdateVariableInput) {
  const session = await requireSession();
  const existing = await verifyVariableOwnership(id, session.user.id);

  const validated = updateVariableSchema.parse(input);
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (validated.key) {
    updates.key = validated.key;
  }

  if (validated.value) {
    updates.encryptedValue = encrypt(validated.value);
  }

  if (validated.description !== undefined) {
    updates.description = validated.description || null;
  }

  const [updated] = await db
    .update(environmentVariables)
    .set(updates)
    .where(eq(environmentVariables.id, id))
    .returning();

  revalidatePath(`/projects/${existing.projects.id}`);
  return updated;
}

export async function deleteVariable(id: string) {
  const session = await requireSession();
  const existing = await verifyVariableOwnership(id, session.user.id);

  await db.delete(environmentVariables).where(eq(environmentVariables.id, id));

  revalidatePath(`/projects/${existing.projects.id}`);
}

"use server";

import { db } from "@/db";
import { environments } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { mapDbError } from "@/lib/db/errors";
import {
  verifyEnvironmentOwnership,
  verifyProjectOwnership,
} from "@/lib/ownership";
import {
  createEnvironmentSchema,
  updateEnvironmentSchema,
} from "@/lib/validators/environment";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type {
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
} from "@/lib/validators/environment";

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function getEnvironments(projectId: string) {
  const session = await requireSession();
  await verifyProjectOwnership(projectId, session.user.id);

  return db
    .select()
    .from(environments)
    .where(eq(environments.projectId, projectId))
    .orderBy(environments.createdAt);
}

export async function getEnvironment(id: string) {
  const session = await requireSession();
  const environment = await verifyEnvironmentOwnership(id, session.user.id);
  return environment.environments;
}

export async function createEnvironment(
  projectId: string,
  input: CreateEnvironmentInput
) {
  const session = await requireSession();
  await verifyProjectOwnership(projectId, session.user.id);

  const validated = createEnvironmentSchema.parse(input);

  let inserted;
  try {
    inserted = await db
      .insert(environments)
      .values({
        id: nanoid(),
        projectId,
        name: validated.name,
        slug: slugify(validated.name),
      })
      .returning();
  } catch (error) {
    throw mapDbError(error);
  }

  revalidatePath(`/projects/${projectId}`);
  return inserted[0];
}

export async function updateEnvironment(
  id: string,
  input: UpdateEnvironmentInput
) {
  const session = await requireSession();
  const existing = await verifyEnvironmentOwnership(id, session.user.id);

  const validated = updateEnvironmentSchema.parse(input);
  const updates: Partial<typeof environments.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (validated.name) {
    updates.name = validated.name;
    updates.slug = slugify(validated.name);
  }

  let updated;
  try {
    updated = await db
      .update(environments)
      .set(updates)
      .where(eq(environments.id, id))
      .returning();
  } catch (error) {
    throw mapDbError(error);
  }

  revalidatePath(`/projects/${existing.projects.id}`);
  return updated[0];
}

export async function deleteEnvironment(id: string) {
  const session = await requireSession();
  const existing = await verifyEnvironmentOwnership(id, session.user.id);

  await db.delete(environments).where(eq(environments.id, id));

  revalidatePath(`/projects/${existing.projects.id}`);
}

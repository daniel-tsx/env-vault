"use server";

import { db } from "@/db";
import { environments, projects } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import {
  createEnvironmentSchema,
  updateEnvironmentSchema,
} from "@/lib/validators/environment";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type {
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
} from "@/lib/validators/environment";

async function verifyProjectOwnership(projectId: string, userId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

export async function getEnvironments(projectId: string) {
  const session = await requireSession();
  await verifyProjectOwnership(projectId, session.user.id);

  return await db
    .select()
    .from(environments)
    .where(eq(environments.projectId, projectId))
    .orderBy(environments.createdAt);
}

export async function getEnvironment(id: string) {
  const session = await requireSession();

  const [environment] = await db
    .select({
      id: environments.id,
      name: environments.name,
      slug: environments.slug,
      projectId: environments.projectId,
      createdAt: environments.createdAt,
      updatedAt: environments.updatedAt,
    })
    .from(environments)
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(
      and(eq(environments.id, id), eq(projects.userId, session.user.id))
    )
    .limit(1);

  if (!environment) {
    throw new Error("Environment not found");
  }

  return environment;
}

export async function createEnvironment(
  projectId: string,
  input: CreateEnvironmentInput
) {
  const session = await requireSession();
  await verifyProjectOwnership(projectId, session.user.id);

  const validated = createEnvironmentSchema.parse(input);
  const slug = validated.name.toLowerCase().replace(/\s+/g, "-");

  const [environment] = await db
    .insert(environments)
    .values({
      id: nanoid(),
      projectId,
      name: validated.name,
      slug,
    })
    .returning();

  revalidatePath(`/projects/${projectId}`);
  return environment;
}

export async function updateEnvironment(
  id: string,
  input: UpdateEnvironmentInput
) {
  const session = await requireSession();

  const [existing] = await db
    .select()
    .from(environments)
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(
      and(eq(environments.id, id), eq(projects.userId, session.user.id))
    )
    .limit(1);

  if (!existing) {
    throw new Error("Environment not found");
  }

  const validated = updateEnvironmentSchema.parse(input);
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (validated.name) {
    updates.name = validated.name;
    updates.slug = validated.name.toLowerCase().replace(/\s+/g, "-");
  }

  const [updated] = await db
    .update(environments)
    .set(updates)
    .where(eq(environments.id, id))
    .returning();

  revalidatePath(`/projects/${existing.projects.id}`);
  return updated;
}

export async function deleteEnvironment(id: string) {
  const session = await requireSession();

  const [existing] = await db
    .select()
    .from(environments)
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(
      and(eq(environments.id, id), eq(projects.userId, session.user.id))
    )
    .limit(1);

  if (!existing) {
    throw new Error("Environment not found");
  }

  await db.delete(environments).where(eq(environments.id, id));

  revalidatePath(`/projects/${existing.projects.id}`);
}

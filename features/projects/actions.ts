"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { createProjectSchema, updateProjectSchema } from "@/lib/validators/project";
import { eq, and, like } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validators/project";

export async function getProjects(search?: string) {
  const session = await requireSession();

  let query = db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(projects.createdAt);

  if (search) {
    query = db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.userId, session.user.id),
          like(projects.name, `%${search}%`)
        )
      )
      .orderBy(projects.createdAt);
  }

  return await query;
}

export async function getProject(id: string) {
  const session = await requireSession();

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

export async function createProject(input: CreateProjectInput) {
  const session = await requireSession();
  const validated = createProjectSchema.parse(input);

  const [project] = await db
    .insert(projects)
    .values({
      id: nanoid(),
      userId: session.user.id,
      name: validated.name,
      description: validated.description || null,
    })
    .returning();

  revalidatePath("/projects");
  return project;
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const session = await requireSession();
  const validated = updateProjectSchema.parse(input);

  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!existing) {
    throw new Error("Project not found");
  }

  const [updated] = await db
    .update(projects)
    .set({
      ...validated,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  return updated;
}

export async function deleteProject(id: string) {
  const session = await requireSession();

  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!existing) {
    throw new Error("Project not found");
  }

  await db.delete(projects).where(eq(projects.id, id));

  revalidatePath("/projects");
}

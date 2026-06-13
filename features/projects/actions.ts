"use server";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit";
import { mapDbError } from "@/lib/db/errors";
import { verifyProjectOwnership } from "@/lib/ownership";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/validators/project";
import { and, eq, ilike } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/validators/project";

export async function getProjects(search?: string) {
  const session = await requireSession();

  const conditions = [eq(projects.userId, session.user.id)];
  if (search) {
    const escaped = search.replace(/[%_\\]/g, "\\$&");
    conditions.push(ilike(projects.name, `%${escaped}%`));
  }

  return db
    .select()
    .from(projects)
    .where(and(...conditions))
    .orderBy(projects.createdAt);
}

export async function getProject(id: string) {
  const session = await requireSession();
  return verifyProjectOwnership(id, session.user.id);
}

export async function createProject(input: CreateProjectInput) {
  const session = await requireSession();
  const validated = createProjectSchema.parse(input);

  let inserted;
  try {
    inserted = await db
      .insert(projects)
      .values({
        id: nanoid(),
        userId: session.user.id,
        name: validated.name,
        description: validated.description || null,
      })
      .returning();
  } catch (error) {
    throw mapDbError(error);
  }

  revalidatePath("/projects");
  await logAudit({
    userId: session.user.id,
    action: "project.create",
    resourceType: "project",
    resourceId: inserted[0].id,
    label: validated.name,
  });
  return inserted[0];
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const session = await requireSession();
  await verifyProjectOwnership(id, session.user.id);

  const validated = updateProjectSchema.parse(input);

  let updated;
  try {
    updated = await db
      .update(projects)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
  } catch (error) {
    throw mapDbError(error);
  }

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  await logAudit({
    userId: session.user.id,
    action: "project.update",
    resourceType: "project",
    resourceId: id,
    label: updated[0].name,
  });
  return updated[0];
}

export async function deleteProject(id: string) {
  const session = await requireSession();
  const project = await verifyProjectOwnership(id, session.user.id);

  await db.delete(projects).where(eq(projects.id, id));

  revalidatePath("/projects");
  await logAudit({
    userId: session.user.id,
    action: "project.delete",
    resourceType: "project",
    resourceId: id,
    label: project.name,
  });
}

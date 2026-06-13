import { db } from "@/db";
import { environments, environmentVariables, projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Resource-ownership checks shared by the feature server actions. Each verifies
 * the resource belongs to the given user and throws a generic "not found" error
 * otherwise (so existence isn't leaked across accounts). The joined shapes match
 * what the callers consume (e.g. `.projects.id`, `.environment_variables`).
 */

export async function verifyProjectOwnership(projectId: string, userId: string) {
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

export async function verifyEnvironmentOwnership(
  environmentId: string,
  userId: string
) {
  const [environment] = await db
    .select()
    .from(environments)
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(and(eq(environments.id, environmentId), eq(projects.userId, userId)))
    .limit(1);

  if (!environment) {
    throw new Error("Environment not found");
  }

  return environment;
}

export async function verifyVariableOwnership(id: string, userId: string) {
  const [variable] = await db
    .select()
    .from(environmentVariables)
    .innerJoin(
      environments,
      eq(environmentVariables.environmentId, environments.id)
    )
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(and(eq(environmentVariables.id, id), eq(projects.userId, userId)))
    .limit(1);

  if (!variable) {
    throw new Error("Variable not found");
  }

  return variable;
}

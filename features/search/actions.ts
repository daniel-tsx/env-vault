"use server";

import { db } from "@/db";
import { environments, environmentVariables, projects } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { escapeLike } from "@/lib/sql";
import { and, eq, ilike } from "drizzle-orm";

export type SearchResults = {
  projects: { id: string; name: string }[];
  variables: {
    id: string;
    key: string;
    projectId: string;
    projectName: string;
    environmentName: string;
  }[];
};

// Searches the current user's projects (by name) and variables (by key only,
// never values) across every project. Ownership is enforced in each query.
export async function searchAll(query: string): Promise<SearchResults> {
  const session = await requireSession();
  const trimmed = query.trim();
  if (!trimmed) return { projects: [], variables: [] };

  const pattern = `%${escapeLike(trimmed)}%`;

  const projectRows = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(
      and(eq(projects.userId, session.user.id), ilike(projects.name, pattern))
    )
    .orderBy(projects.name)
    .limit(8);

  const variableRows = await db
    .select({
      id: environmentVariables.id,
      key: environmentVariables.key,
      projectId: projects.id,
      projectName: projects.name,
      environmentName: environments.name,
    })
    .from(environmentVariables)
    .innerJoin(
      environments,
      eq(environmentVariables.environmentId, environments.id)
    )
    .innerJoin(projects, eq(environments.projectId, projects.id))
    .where(
      and(
        eq(projects.userId, session.user.id),
        ilike(environmentVariables.key, pattern)
      )
    )
    .orderBy(environmentVariables.key)
    .limit(20);

  return { projects: projectRows, variables: variableRows };
}

/**
 * Maps a database error into a safe, user-facing Error so raw driver messages
 * (which can contain internal details) never reach the client. Known unique
 * constraints become friendly messages; everything else becomes a generic one.
 *
 * Wrap only the DB call with this — validation (Zod) and ownership errors are
 * thrown before/outside the DB call and keep their own meaningful messages.
 */

type PgErrorLike = {
  code?: unknown;
  constraint?: unknown;
  constraint_name?: unknown;
  cause?: unknown;
};

function findPgError(error: unknown): PgErrorLike | null {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current && typeof current === "object"; depth++) {
    const candidate = current as PgErrorLike;
    if (typeof candidate.code === "string") return candidate;
    current = candidate.cause;
  }
  return null;
}

export function mapDbError(error: unknown): Error {
  const pg = findPgError(error);

  // 23505 = unique_violation
  if (pg && pg.code === "23505") {
    const constraint = String(pg.constraint ?? pg.constraint_name ?? "");
    if (constraint.includes("env_vars_env_key")) {
      return new Error("A variable with that key already exists in this environment.");
    }
    if (constraint.includes("environments_project_slug")) {
      return new Error("An environment with that name already exists in this project.");
    }
    return new Error("That value already exists.");
  }

  return new Error("Something went wrong. Please try again.");
}

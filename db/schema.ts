import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// BetterAuth two-factor plugin. Field names (secret, backupCodes, userId,
// verified) must match the plugin's "twoFactor" model. The TOTP secret is
// stored encrypted by BetterAuth using BETTER_AUTH_SECRET.
export const twoFactor = pgTable(
  "two_factor",
  {
    id: text("id").primaryKey(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    verified: boolean("verified").notNull().default(true),
  },
  (table) => [index("two_factor_user_id_idx").on(table.userId)]
);

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("projects_user_id_idx").on(table.userId),
  ]
);

export const environments = pgTable(
  "environments",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("environments_project_slug_idx").on(
      table.projectId,
      table.slug
    ),
    index("environments_project_id_idx").on(table.projectId),
  ]
);

export const environmentVariables = pgTable(
  "environment_variables",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    environmentId: text("environment_id")
      .notNull()
      .references(() => environments.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    encryptedValue: text("encrypted_value").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("env_vars_env_key_idx").on(
      table.environmentId,
      table.key
    ),
    index("env_vars_project_id_idx").on(table.projectId),
    index("env_vars_environment_id_idx").on(table.environmentId),
  ]
);

// Append-only trail of security-relevant events (secret access and mutations).
// Never stores secret values — only non-sensitive labels (e.g. the variable key).
export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    resourceType: text("resource_type"),
    resourceId: text("resource_id"),
    label: text("label"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("audit_log_user_id_idx").on(table.userId),
    index("audit_log_user_created_idx").on(table.userId, table.createdAt),
  ]
);

// BetterAuth's built-in rate limiting (database storage). Field names (id, key,
// count, lastRequest) must match BetterAuth's "rateLimit" model.
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key"),
  count: integer("count"),
  lastRequest: bigint("last_request", { mode: "number" }),
});

// Application-level fixed-window limiter for sensitive server actions
// (e.g. revealing/exporting secrets), which don't go through BetterAuth.
export const appRateLimit = pgTable("app_rate_limit", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start").notNull().defaultNow(),
});

// Prior states of a variable, captured on update/delete/restore. Not FK'd to
// environment_variables so history survives variable deletion; scoped to the
// project (cascade) for ownership checks and cleanup.
export const variableVersions = pgTable(
  "variable_versions",
  {
    id: text("id").primaryKey(),
    variableId: text("variable_id").notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    environmentId: text("environment_id").notNull(),
    key: text("key").notNull(),
    encryptedValue: text("encrypted_value").notNull(),
    description: text("description"),
    action: text("action").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("variable_versions_variable_id_idx").on(table.variableId),
    index("variable_versions_project_id_idx").on(table.projectId),
  ]
);

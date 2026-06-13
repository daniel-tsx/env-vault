CREATE TABLE "variable_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"variable_id" text NOT NULL,
	"project_id" text NOT NULL,
	"environment_id" text NOT NULL,
	"key" text NOT NULL,
	"encrypted_value" text NOT NULL,
	"description" text,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "variable_versions" ADD CONSTRAINT "variable_versions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "variable_versions_variable_id_idx" ON "variable_versions" USING btree ("variable_id");--> statement-breakpoint
CREATE INDEX "variable_versions_project_id_idx" ON "variable_versions" USING btree ("project_id");
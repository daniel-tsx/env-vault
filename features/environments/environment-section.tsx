"use client";

import { useState } from "react";
import { deleteEnvironment } from "@/features/environments/actions";
import { VariableList } from "@/features/variables/variable-list";
import { AddVariableForm } from "@/features/variables/add-variable-form";
import { Trash2, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { InferSelectModel } from "drizzle-orm";
import type { environments, environmentVariables } from "@/db/schema";

type Environment = InferSelectModel<typeof environments>;
type Variable = Pick<
  InferSelectModel<typeof environmentVariables>,
  "id" | "key" | "description" | "createdAt" | "updatedAt"
>;

export function EnvironmentSection({
  environment,
  variables,
  projectId,
}: {
  environment: Environment;
  variables: Variable[];
  projectId: string;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteEnvironment(environment.id);
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 font-medium hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          {environment.name}
          <span className="text-sm text-muted-foreground font-normal">
            ({variables.length} variable{variables.length !== 1 ? "s" : ""})
          </span>
        </button>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Delete this environment?
              </span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm bg-destructive text-white px-3 py-1 rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
              >
                {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm px-3 py-1 rounded border border-border hover:bg-accent"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              title="Delete environment"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="p-4">
          <VariableList variables={variables} />
          <AddVariableForm environmentId={environment.id} />
        </div>
      )}
    </div>
  );
}

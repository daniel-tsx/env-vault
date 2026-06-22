"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Server } from "lucide-react";
import { toast } from "sonner";
import {
  createEnvironment as createEnvironmentAction,
  updateEnvironment as updateEnvironmentAction,
  deleteEnvironment as deleteEnvironmentAction,
} from "@/features/environments/actions";
import {
  createVariable as createVariableAction,
  updateVariable as updateVariableAction,
  deleteVariable as deleteVariableAction,
} from "@/features/variables/actions";
import { CreateEnvironmentDialog } from "@/features/environments/create-environment-dialog";
import {
  EnvironmentSection,
  type EnvironmentView,
} from "@/features/environments/environment-section";
import type { VariableView } from "@/features/variables/variable-list";
import { Card, CardContent } from "@/components/ui/card";
import type {
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
} from "@/lib/validators/environment";
import type {
  CreateVariableInput,
  UpdateVariableInput,
} from "@/lib/validators/variable";

type AddVariableInput = Omit<CreateVariableInput, "environmentId">;

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

type EnvAction =
  | { type: "add"; environment: EnvironmentView }
  | { type: "delete"; id: string }
  | { type: "rename"; id: string; name?: string; slug?: string };

function envReducer(
  state: EnvironmentView[],
  action: EnvAction
): EnvironmentView[] {
  switch (action.type) {
    case "add":
      return [...state, action.environment];
    case "delete":
      return state.filter((e) => e.id !== action.id);
    case "rename":
      // In-place rename of an existing row: apply instantly but keep the row
      // interactive (no `pending` dim — it already exists server-side).
      return state.map((e) =>
        e.id === action.id
          ? { ...e, name: action.name ?? e.name, slug: action.slug ?? e.slug }
          : e
      );
  }
}

type VarAction =
  | { type: "add"; variable: VariableView }
  | { type: "delete"; id: string }
  | { type: "update"; id: string; key?: string; description?: string | null };

function varReducer(state: VariableView[], action: VarAction): VariableView[] {
  switch (action.type) {
    case "add":
      return [...state, action.variable];
    case "delete":
      return state.filter((v) => v.id !== action.id);
    case "update":
      // In-place edit of an existing row: apply instantly but keep it
      // interactive (no `pending` dim — it already exists server-side).
      return state.map((v) =>
        v.id === action.id
          ? {
              ...v,
              key: action.key ?? v.key,
              description:
                action.description !== undefined
                  ? action.description
                  : v.description,
            }
          : v
      );
  }
}

export function EnvironmentsBoard({
  projectId,
  initialEnvironments,
  initialVariables,
}: {
  projectId: string;
  initialEnvironments: EnvironmentView[];
  initialVariables: VariableView[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [environments, dispatchEnv] = useOptimistic(
    initialEnvironments,
    envReducer
  );
  const [variables, dispatchVar] = useOptimistic(initialVariables, varReducer);

  // Bridges a transition to an awaitable promise so dialogs/forms can close or
  // surface inline errors. The optimistic change auto-reverts if the action
  // throws; the server action's revalidatePath + router.refresh reconcile.
  function run(apply: () => void, mutate: () => Promise<unknown>) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        apply();
        try {
          await mutate();
          router.refresh();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  function createEnvironment(input: CreateEnvironmentInput) {
    return run(
      () =>
        dispatchEnv({
          type: "add",
          environment: {
            id: `temp-${crypto.randomUUID()}`,
            projectId,
            name: input.name,
            slug: slugify(input.name),
            createdAt: new Date(),
            updatedAt: new Date(),
            pending: true,
          },
        }),
      () => createEnvironmentAction(projectId, input)
    );
  }

  function renameEnvironment(id: string, input: UpdateEnvironmentInput) {
    return run(
      () =>
        dispatchEnv({
          type: "rename",
          id,
          name: input.name,
          slug: input.name ? slugify(input.name) : undefined,
        }),
      () => updateEnvironmentAction(id, input)
    );
  }

  function deleteEnvironment(id: string) {
    startTransition(async () => {
      dispatchEnv({ type: "delete", id });
      try {
        await deleteEnvironmentAction(id);
        router.refresh();
      } catch {
        toast.error("Failed to delete environment");
      }
    });
  }

  function addVariable(environmentId: string, input: AddVariableInput) {
    return run(
      () =>
        dispatchVar({
          type: "add",
          variable: {
            id: `temp-${crypto.randomUUID()}`,
            key: input.key,
            description: input.description || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            environmentId,
            pending: true,
          },
        }),
      () => createVariableAction({ ...input, environmentId })
    );
  }

  function updateVariable(id: string, input: UpdateVariableInput) {
    return run(
      () =>
        dispatchVar({
          type: "update",
          id,
          key: input.key,
          description: input.description,
        }),
      () => updateVariableAction(id, input)
    );
  }

  function deleteVariable(id: string) {
    startTransition(async () => {
      dispatchVar({ type: "delete", id });
      try {
        await deleteVariableAction(id);
        router.refresh();
      } catch {
        toast.error("Failed to delete variable");
      }
    });
  }

  return (
    <div className="ev-reveal" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Environments</h2>
        <CreateEnvironmentDialog onCreate={createEnvironment} />
      </div>

      {environments.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Server className="size-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No environments yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Create your first environment to start adding variables.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {environments.map((environment) => (
            <EnvironmentSection
              key={environment.id}
              environment={environment}
              variables={variables
                .filter((v) => v.environmentId === environment.id)
                .sort((a, b) => a.key.localeCompare(b.key))}
              onRenameEnvironment={(input) =>
                renameEnvironment(environment.id, input)
              }
              onDeleteEnvironment={() => deleteEnvironment(environment.id)}
              onAddVariable={(input) => addVariable(environment.id, input)}
              onDeleteVariable={deleteVariable}
              onUpdateVariable={updateVariable}
            />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { VariableList, type VariableView } from "@/features/variables/variable-list";
import { AddVariableForm } from "@/features/variables/add-variable-form";
import { ImportEnvDialog } from "@/features/variables/import-env-dialog";
import { ExportEnvButton } from "@/features/variables/export-env-button";
import { EditEnvironmentDialog } from "@/features/environments/edit-environment-dialog";
import { Trash2, ChevronDown, ChevronRight, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { InferSelectModel } from "drizzle-orm";
import type { environments } from "@/db/schema";
import type { CreateVariableInput, UpdateVariableInput } from "@/lib/validators/variable";
import type { UpdateEnvironmentInput } from "@/lib/validators/environment";

export type EnvironmentView = InferSelectModel<typeof environments> & {
  pending?: boolean;
};

type AddVariableInput = Omit<CreateVariableInput, "environmentId">;

export function EnvironmentSection({
  environment,
  variables,
  onRenameEnvironment,
  onDeleteEnvironment,
  onAddVariable,
  onDeleteVariable,
  onUpdateVariable,
}: {
  environment: EnvironmentView;
  variables: VariableView[];
  onRenameEnvironment: (input: UpdateEnvironmentInput) => Promise<void>;
  onDeleteEnvironment: () => void;
  onAddVariable: (input: AddVariableInput) => Promise<void>;
  onDeleteVariable: (id: string) => void;
  onUpdateVariable: (id: string, input: UpdateVariableInput) => Promise<void>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pending = environment.pending ?? false;

  return (
    <Card
      className={`overflow-hidden rounded-2xl border-border/60 ${
        pending ? "opacity-60 animate-pulse pointer-events-none" : ""
      }`}
    >
      <CardHeader className="pb-4 bg-muted/30 border-b border-border/60">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 font-semibold hover:text-primary transition-colors group"
          >
            {collapsed ? (
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground group-hover:text-primary" />
            )}
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Server className="size-4 text-primary" />
            </div>
            <span className="text-lg">{environment.name}</span>
            <Badge variant="secondary" className="ml-2">
              {variables.length} variable{variables.length !== 1 ? "s" : ""}
            </Badge>
          </button>
          <div className="flex items-center gap-1">
            <EditEnvironmentDialog
              environment={environment}
              onRename={onRenameEnvironment}
            />
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                  />
                }
              >
                <Trash2 className="size-4" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete environment</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the{" "}
                    <strong>{environment.name}</strong> environment and all its
                    variables. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteEnvironment}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="pt-6">
          <VariableList
            variables={variables}
            onDelete={onDeleteVariable}
            onUpdate={onUpdateVariable}
          />
          <div className="mt-6 pt-6 border-t border-border/60 space-y-3">
            <AddVariableForm onAdd={onAddVariable} />
            <div className="flex flex-wrap gap-2">
              <ImportEnvDialog environmentId={environment.id} />
              <ExportEnvButton environmentId={environment.id} />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

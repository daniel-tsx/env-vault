"use client";

import { useState } from "react";
import { deleteEnvironment } from "@/features/environments/actions";
import { VariableList } from "@/features/variables/variable-list";
import { AddVariableForm } from "@/features/variables/add-variable-form";
import { Trash2, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 font-medium hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            {environment.name}
            <Badge variant="secondary">
              {variables.length} variable{variables.length !== 1 ? "s" : ""}
            </Badge>
          </button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
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
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="pt-0">
          <VariableList variables={variables} />
          <AddVariableForm environmentId={environment.id} />
        </CardContent>
      )}
    </Card>
  );
}

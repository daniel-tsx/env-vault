"use client";

import { useState } from "react";
import { revealVariable, deleteVariable } from "@/features/variables/actions";
import { Eye, EyeOff, Copy, Trash2, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { toast } from "sonner";
import type { InferSelectModel } from "drizzle-orm";
import type { environmentVariables } from "@/db/schema";

type Variable = Pick<
  InferSelectModel<typeof environmentVariables>,
  "id" | "key" | "description" | "createdAt" | "updatedAt"
>;

export function VariableList({ variables }: { variables: Variable[] }) {
  if (variables.length === 0) {
    return (
      <p className="text-sm text-muted-foreground mb-4">
        No variables in this environment yet.
      </p>
    );
  }

  return (
    <div className="space-y-2 mb-4">
      {variables.map((variable) => (
        <VariableItem key={variable.id} variable={variable} />
      ))}
    </div>
  );
}

function VariableItem({ variable }: { variable: Variable }) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleReveal() {
    if (revealed) {
      setRevealed(false);
      setValue(null);
      return;
    }

    setLoading(true);
    try {
      const result = await revealVariable(variable.id);
      setValue(result.value);
      setRevealed(true);
    } catch (err) {
      toast.error("Failed to reveal variable");
      console.error("Failed to reveal variable:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!value) {
      setLoading(true);
      try {
        const result = await revealVariable(variable.id);
        setValue(result.value);
        setRevealed(true);
        await navigator.clipboard.writeText(result.value);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy variable");
        console.error("Failed to copy variable:", err);
      } finally {
        setLoading(false);
      }
    } else {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteVariable(variable.id);
      toast.success("Variable deleted");
      router.refresh();
    } catch (err) {
      toast.error("Failed to delete variable");
      console.error("Failed to delete variable:", err);
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-muted/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <code className="text-sm font-mono font-medium">{variable.key}</code>
        </div>
        {variable.description && (
          <p className="text-xs text-muted-foreground truncate">
            {variable.description}
          </p>
        )}
        <div className="mt-1">
          {revealed && value ? (
            <code className="text-xs font-mono text-muted-foreground break-all">
              {value}
            </code>
          ) : (
            <Badge variant="outline" className="font-mono">
              ••••••••••••
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReveal}
                disabled={loading}
                className="size-8"
              />
            }
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : revealed ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </TooltipTrigger>
          <TooltipContent>{revealed ? "Hide value" : "Reveal value"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={loading}
                className="size-8"
              />
            }
          >
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </TooltipTrigger>
          <TooltipContent>Copy value</TooltipContent>
        </Tooltip>

        <AlertDialog>
          <Tooltip>
            <TooltipTrigger
              render={
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                    />
                  }
                />
              }
            >
              <Trash2 className="size-4" />
            </TooltipTrigger>
            <TooltipContent>Delete variable</TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete variable</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the variable{" "}
                <strong>{variable.key}</strong>. This action cannot be undone.
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
    </div>
  );
}

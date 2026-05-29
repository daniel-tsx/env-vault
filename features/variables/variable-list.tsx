"use client";

import { useState } from "react";
import { revealVariable, deleteVariable } from "@/features/variables/actions";
import { Eye, EyeOff, Copy, Trash2, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const [confirmDelete, setConfirmDelete] = useState(false);
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
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy variable:", err);
      } finally {
        setLoading(false);
      }
    } else {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteVariable(variable.id);
      router.refresh();
    } catch (err) {
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
            <code className="text-xs font-mono text-muted-foreground">
              ••••••••••••
            </code>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleReveal}
          disabled={loading}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          title={revealed ? "Hide value" : "Reveal value"}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : revealed ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={handleCopy}
          disabled={loading}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          title="Copy value"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs bg-destructive text-white px-2 py-1 rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            >
              {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-2 py-1 rounded border border-border hover:bg-accent"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete variable"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

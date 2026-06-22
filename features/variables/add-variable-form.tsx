"use client";

import { useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CreateVariableInput } from "@/lib/validators/variable";

type AddVariableInput = Omit<CreateVariableInput, "environmentId">;

export function AddVariableForm({
  onAdd,
}: {
  onAdd: (input: AddVariableInput) => Promise<void>;
}) {
  const keyInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onAdd({
        key: key.toUpperCase(),
        value,
        description,
      });
      // Keep the form open and clear the fields so several variables can be
      // added back-to-back; each appears instantly via the optimistic list.
      setKey("");
      setValue("");
      setDescription("");
      keyInputRef.current?.focus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create variable"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <Plus className="size-4" />
        Add variable
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border border-border/50 rounded-lg p-5 bg-muted/20"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="var-key" className="text-sm font-medium">
            Key
          </Label>
          <Input
            id="var-key"
            ref={keyInputRef}
            type="text"
            required
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            className="font-mono"
            placeholder="API_KEY"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="var-value" className="text-sm font-medium">
            Value
          </Label>
          <Input
            id="var-value"
            type="text"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="font-mono"
            placeholder="secret-value"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="var-description" className="text-sm font-medium">
          Description (optional)
        </Label>
        <Input
          id="var-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this variable for?"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Done
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Add variable
        </Button>
      </div>
    </form>
  );
}

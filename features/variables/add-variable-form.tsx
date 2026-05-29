"use client";

import { useState } from "react";
import { createVariable } from "@/features/variables/actions";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddVariableForm({ environmentId }: { environmentId: string }) {
  const router = useRouter();
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
      await createVariable({
        key: key.toUpperCase(),
        value,
        description,
        environmentId,
      });
      setKey("");
      setValue("");
      setDescription("");
      setOpen(false);
      router.refresh();
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
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <Plus className="w-4 h-4" />
        Add variable
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border border-border rounded-md p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="var-key"
            className="block text-xs font-medium mb-1"
          >
            Key
          </label>
          <input
            id="var-key"
            type="text"
            required
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="API_KEY"
          />
        </div>

        <div>
          <label
            htmlFor="var-value"
            className="block text-xs font-medium mb-1"
          >
            Value
          </label>
          <input
            id="var-value"
            type="text"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="secret-value"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="var-description"
          className="block text-xs font-medium mb-1"
        >
          Description (optional)
        </label>
        <input
          id="var-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="What is this variable for?"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Add
        </button>
      </div>
    </form>
  );
}

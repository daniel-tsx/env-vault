"use client";

import { useState } from "react";
import { deleteProject } from "@/features/projects/actions";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteProjectButton({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (confirmName !== projectName) {
      setError("Project name does not match");
      return;
    }

    setLoading(true);
    try {
      await deleteProject(projectId);
      router.push("/projects");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project"
      );
      setLoading(false);
    }
  }

  if (!confirmDelete) {
    return (
      <button
        onClick={() => setConfirmDelete(true)}
        className="text-muted-foreground hover:text-destructive transition-colors p-2"
        title="Delete project"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Delete project</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This will permanently delete <strong>{projectName}</strong> and all
          its environments and variables. This action cannot be undone.
        </p>

        <div className="mb-4">
          <label
            htmlFor="confirm-name"
            className="block text-sm font-medium mb-1.5"
          >
            Type <strong>{projectName}</strong> to confirm
          </label>
          <input
            id="confirm-name"
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => {
              setConfirmDelete(false);
              setConfirmName("");
              setError("");
            }}
            className="px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || confirmName !== projectName}
            className="bg-destructive text-white px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

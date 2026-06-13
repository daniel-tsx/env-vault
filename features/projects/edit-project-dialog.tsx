"use client";

import { useState } from "react";
import { updateProject } from "@/features/projects/actions";
import { Pencil, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export function EditProjectDialog({
  project,
}: {
  project: { id: string; name: string; description: string | null };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetFields() {
    setName(project.name);
    setDescription(project.description ?? "");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await updateProject(project.id, { name, description });
      setOpen(false);
      toast.success("Project updated");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) resetFields();
        setOpen(next);
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                />
              }
            />
          }
        >
          <Pencil className="size-5" />
        </TooltipTrigger>
        <TooltipContent>Edit project</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit project</DialogTitle>
          <DialogDescription>
            Update your project name and description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name" className="text-sm font-medium">
                Project name
              </Label>
              <Input
                id="edit-project-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-project-description"
                className="text-sm font-medium"
              >
                Description (optional)
              </Label>
              <Textarea
                id="edit-project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project about?"
                rows={3}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-11">
              {loading && <Loader2 className="size-4 animate-spin mr-2" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

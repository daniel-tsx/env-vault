"use client";

import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { UpdateVariableInput } from "@/lib/validators/variable";

type EditableVariable = {
  id: string;
  key: string;
  description: string | null;
};

export function EditVariableDialog({
  variable,
  onSubmit,
  disabled = false,
}: {
  variable: EditableVariable;
  onSubmit: (id: string, input: UpdateVariableInput) => Promise<void>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(variable.key);
  const [value, setValue] = useState("");
  const [description, setDescription] = useState(variable.description ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetFields() {
    setKey(variable.key);
    setValue("");
    setDescription(variable.description ?? "");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(variable.id, {
        key: key.toUpperCase(),
        description,
        // Only re-encrypt the value when a new one is entered; leaving it blank
        // keeps the current value (and avoids revealing it to edit).
        ...(value ? { value } : {}),
      });
      setOpen(false);
      setValue("");
      toast.success("Variable updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update variable");
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
                  className="size-9"
                  disabled={disabled}
                />
              }
            />
          }
        >
          <Pencil className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Edit variable</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit variable</DialogTitle>
          <DialogDescription>
            Update the key, value, or description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-var-key" className="text-sm font-medium">
                Key
              </Label>
              <Input
                id="edit-var-key"
                type="text"
                required
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                className="font-mono h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-var-value" className="text-sm font-medium">
                Value
              </Label>
              <Input
                id="edit-var-value"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="font-mono h-11"
                placeholder="Leave blank to keep current value"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="edit-var-description"
                className="text-sm font-medium"
              >
                Description (optional)
              </Label>
              <Input
                id="edit-var-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this variable for?"
                className="h-11"
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

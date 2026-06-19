"use client";

import { useState } from "react";
import { importVariables } from "@/features/variables/actions";
import { parseEnv } from "@/lib/env-file";
import { Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export function ImportEnvDialog({ environmentId }: { environmentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const parsedCount = content.trim() ? parseEnv(content).length : 0;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setContent(await file.text());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await importVariables(
        environmentId,
        content,
        overwrite ? "overwrite" : "skip"
      );
      toast.success(
        `Imported: ${result.created} added, ${result.updated} updated, ${result.skipped} skipped`
      );
      if (result.invalid.length > 0) {
        toast.error(
          `Skipped ${result.invalid.length} invalid key(s): ${result.invalid
            .slice(0, 5)
            .join(", ")}`
        );
      }
      setContent("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setContent("");
          setError("");
        }
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Upload className="size-4" />
        Import .env
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Import .env</DialogTitle>
          <DialogDescription>
            Paste or upload a .env file. Keys must be UPPER_SNAKE_CASE; invalid
            keys are reported and skipped.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder={"API_KEY=sk-...\nDATABASE_URL=postgres://..."}
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between gap-4">
              <input
                type="file"
                accept=".env,text/plain"
                onChange={handleFile}
                className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-secondary/80"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {parsedCount} variable{parsedCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="overwrite"
                checked={overwrite}
                onCheckedChange={(checked) => setOverwrite(checked)}
              />
              <Label htmlFor="overwrite" className="text-sm font-normal">
                Overwrite variables that already exist
              </Label>
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
            <Button type="submit" disabled={loading || parsedCount === 0}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Import{parsedCount > 0 ? ` ${parsedCount}` : ""}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

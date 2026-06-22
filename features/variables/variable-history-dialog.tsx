"use client";

import { useState } from "react";
import {
  getVariableHistory,
  revealVersion,
  restoreVariableVersion,
} from "@/features/variables/actions";
import { StepUpDialog } from "@/features/auth/step-up-dialog";
import { History, Loader2, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

type Version = Awaited<ReturnType<typeof getVariableHistory>>[number];

export function VariableHistoryDialog({
  variableId,
  disabled = false,
}: {
  variableId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [pendingRevealId, setPendingRevealId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setVersions(await getVariableHistory(variableId));
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setRevealed({});
      load();
    }
  }

  async function reveal(versionId: string) {
    if (revealed[versionId]) {
      setRevealed((current) => {
        const copy = { ...current };
        delete copy[versionId];
        return copy;
      });
      return;
    }
    setBusyId(versionId);
    try {
      const result = await revealVersion(versionId);
      if (result.status === "step_up_required") {
        setPendingRevealId(versionId);
        setStepUpOpen(true);
        return;
      }
      if (result.status === "rate_limited") {
        toast.error(
          `Too many requests. Try again in ${result.retryAfterSeconds}s.`
        );
        return;
      }
      setRevealed((current) => ({ ...current, [versionId]: result.value }));
    } catch {
      toast.error("Failed to reveal value");
    } finally {
      setBusyId(null);
    }
  }

  function onStepUpVerified() {
    const id = pendingRevealId;
    setPendingRevealId(null);
    if (id) reveal(id);
  }

  async function restore(versionId: string) {
    setBusyId(versionId);
    try {
      await restoreVariableVersion(versionId);
      toast.success("Variable restored");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to restore");
      setBusyId(null);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <History className="size-4" />
          </TooltipTrigger>
          <TooltipContent>History</TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Variable history</DialogTitle>
            <DialogDescription>
              Previous values captured on each change. Revealing a value requires
              re-authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1">
            {loading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : versions.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No history yet. Edits and deletions will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="rounded-lg border border-border/50 p-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {version.action}
                        </Badge>
                        <code className="text-xs font-mono">{version.key}</code>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {version.description && (
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {version.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        {revealed[version.id] ? (
                          <code className="text-xs font-mono text-primary bg-primary/5 px-2 py-1 rounded break-all">
                            {revealed[version.id]}
                          </code>
                        ) : (
                          <Badge variant="outline" className="font-mono text-xs">
                            ••••••••••••
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => reveal(version.id)}
                        disabled={busyId === version.id}
                      >
                        {busyId === version.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : revealed[version.id] ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restore(version.id)}
                        disabled={busyId === version.id}
                      >
                        <RotateCcw className="size-3.5" />
                        Restore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <StepUpDialog
        open={stepUpOpen}
        onOpenChange={setStepUpOpen}
        onVerified={onStepUpVerified}
      />
    </>
  );
}

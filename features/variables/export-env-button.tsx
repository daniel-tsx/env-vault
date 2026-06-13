"use client";

import { useState } from "react";
import { exportEnvironment } from "@/features/variables/actions";
import { StepUpDialog } from "@/features/auth/step-up-dialog";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ExportEnvButton({ environmentId }: { environmentId: string }) {
  const [loading, setLoading] = useState(false);
  const [stepUpOpen, setStepUpOpen] = useState(false);

  function downloadFile(filename: string, content: string) {
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function runExport() {
    setLoading(true);
    try {
      const result = await exportEnvironment(environmentId);
      if (result.status === "step_up_required") {
        setStepUpOpen(true);
        return;
      }
      if (result.status === "rate_limited") {
        toast.error(
          `Too many requests. Try again in ${result.retryAfterSeconds}s.`
        );
        return;
      }
      downloadFile(result.filename, result.content);
      toast.success("Exported .env");
    } catch {
      toast.error("Failed to export");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={runExport}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="size-4 mr-2 animate-spin" />
        ) : (
          <Download className="size-4 mr-2" />
        )}
        Export .env
      </Button>
      <StepUpDialog
        open={stepUpOpen}
        onOpenChange={setStepUpOpen}
        onVerified={runExport}
      />
    </>
  );
}

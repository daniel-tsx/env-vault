"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <TriangleAlert className="size-7 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

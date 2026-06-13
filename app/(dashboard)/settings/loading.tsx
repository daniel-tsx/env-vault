import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-64" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-xl" />
      ))}
    </div>
  );
}

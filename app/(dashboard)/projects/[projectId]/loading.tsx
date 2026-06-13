import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-9 w-32 mb-6" />
      <div className="flex items-start gap-4 mb-8">
        <Skeleton className="size-14 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-5 w-80" />
        </div>
      </div>
      <Skeleton className="h-px w-full mb-8" />
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

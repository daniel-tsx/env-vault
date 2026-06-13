import Link from "next/link";
import { Folder, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { InferSelectModel } from "drizzle-orm";
import type { projects } from "@/db/schema";

type Project = InferSelectModel<typeof projects>;

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
            <Folder className="size-7 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Create your first project to start managing environment variables securely.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`} className="group">
          <Card className="h-full rounded-2xl border-border/60 transition-colors hover:border-primary/40">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary">
                  <Folder className="size-6 text-primary transition-colors group-hover:text-primary-foreground" />
                </div>
                <ArrowRight className="size-5 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1" />
              </div>
              <h3 className="font-semibold text-lg mb-1 transition-colors group-hover:text-primary">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

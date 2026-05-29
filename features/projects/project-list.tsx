import Link from "next/link";
import { Folder, ArrowRight } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { projects } from "@/db/schema";

type Project = InferSelectModel<typeof projects>;

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-lg">
        <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
        <p className="text-muted-foreground">
          Create your first project to start managing environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="block p-6 border border-border rounded-lg hover:bg-accent transition-colors group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Folder className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">{project.name}</h3>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}

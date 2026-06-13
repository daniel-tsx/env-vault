import Link from "next/link";
import { Folder, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { InferSelectModel } from "drizzle-orm";
import type { projects } from "@/db/schema";

type Project = InferSelectModel<typeof projects>;

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <Folder className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
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
          <Card className="h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group-hover:scale-[1.02]">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Folder className="size-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
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

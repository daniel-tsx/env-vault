import Link from "next/link";
import { Folder, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { InferSelectModel } from "drizzle-orm";
import type { projects } from "@/db/schema";

type Project = InferSelectModel<typeof projects>;

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Folder className="size-12 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground text-center">
            Create your first project to start managing environment variables.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`}>
          <Card className="hover:bg-accent/50 transition-colors group cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Folder className="size-5 text-muted-foreground" />
                    <h3 className="font-semibold">{project.name}</h3>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

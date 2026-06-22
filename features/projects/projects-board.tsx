"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { createProject } from "@/features/projects/actions";
import { CreateProjectDialog } from "@/features/projects/create-project-dialog";
import { ProjectList, type ProjectView } from "@/features/projects/project-list";
import { Input } from "@/components/ui/input";
import type { CreateProjectInput } from "@/lib/validators/project";

export function ProjectsBoard({
  initialProjects,
  search,
}: {
  initialProjects: ProjectView[];
  search?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [projects, addOptimisticProject] = useOptimistic(
    initialProjects,
    (current: ProjectView[], project: ProjectView) => [...current, project]
  );

  function handleCreate(input: CreateProjectInput) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        addOptimisticProject({
          id: `temp-${crypto.randomUUID()}`,
          userId: "",
          name: input.name,
          description: input.description || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          pending: true,
        });
        try {
          await createProject(input);
          router.refresh();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  return (
    <div>
      <div className="ev-reveal flex items-start justify-between mb-8">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            {"// projects"}
          </p>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and their environment variables.
          </p>
        </div>
        <CreateProjectDialog onCreate={handleCreate} />
      </div>

      <div className="ev-reveal mb-8" style={{ animationDelay: "60ms" }}>
        <form className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search}
            placeholder="Search projects..."
            className="pl-10 h-11"
          />
        </form>
      </div>

      <div className="ev-reveal" style={{ animationDelay: "120ms" }}>
        <ProjectList projects={projects} />
      </div>
    </div>
  );
}

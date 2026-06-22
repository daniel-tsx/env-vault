"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";
import { updateProject } from "@/features/projects/actions";
import { EditProjectDialog } from "@/features/projects/edit-project-dialog";
import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import type { UpdateProjectInput } from "@/lib/validators/project";

type ProjectHeaderData = {
  id: string;
  name: string;
  description: string | null;
};

export function ProjectHeader({ project }: { project: ProjectHeaderData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [optimisticProject, applyOptimistic] = useOptimistic(
    project,
    (current: ProjectHeaderData, next: UpdateProjectInput) => ({
      ...current,
      name: next.name ?? current.name,
      description: next.description ?? current.description,
    })
  );

  function handleUpdate(input: UpdateProjectInput) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        applyOptimistic(input);
        try {
          await updateProject(project.id, input);
          router.refresh();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  return (
    <div
      className="ev-reveal flex items-start justify-between mb-8"
      style={{ animationDelay: "40ms" }}
    >
      <div className="flex items-start gap-4">
        <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <Folder className="size-7 text-primary" />
        </div>
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            {"// project"}
          </p>
          <h1 className="text-3xl font-bold mb-1">{optimisticProject.name}</h1>
          {optimisticProject.description && (
            <p className="text-muted-foreground">
              {optimisticProject.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <EditProjectDialog project={optimisticProject} onSubmit={handleUpdate} />
        <DeleteProjectButton
          projectId={project.id}
          projectName={optimisticProject.name}
        />
      </div>
    </div>
  );
}

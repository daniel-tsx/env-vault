import { getProject } from "@/features/projects/actions";
import { getEnvironments } from "@/features/environments/actions";
import { getVariablesForProject } from "@/features/variables/actions";
import { ProjectHeader } from "@/features/projects/project-header";
import { EnvironmentsBoard } from "@/features/environments/environments-board";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  const [environments, allVariables] = await Promise.all([
    getEnvironments(projectId),
    getVariablesForProject(projectId),
  ]);

  return (
    <div>
      <Link
        href="/projects"
        className="ev-reveal inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      <ProjectHeader project={project} />

      <Separator className="mb-8" />

      <EnvironmentsBoard
        projectId={projectId}
        initialEnvironments={environments}
        initialVariables={allVariables}
      />
    </div>
  );
}

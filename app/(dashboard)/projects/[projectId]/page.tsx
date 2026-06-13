import { getProject } from "@/features/projects/actions";
import { getEnvironments } from "@/features/environments/actions";
import { getVariablesForProject } from "@/features/variables/actions";
import { CreateEnvironmentDialog } from "@/features/environments/create-environment-dialog";
import { EnvironmentSection } from "@/features/environments/environment-section";
import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import { EditProjectDialog } from "@/features/projects/edit-project-dialog";
import { ArrowLeft, Folder, Server } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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

  const variablesByEnvironment = environments.map((environment) => ({
    environment,
    variables: allVariables.filter((v) => v.environmentId === environment.id),
  }));

  return (
    <div>
      <Link
        href="/projects"
        className="ev-reveal inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-3 mb-6"
      >
        <ArrowLeft className="size-4 mr-2" />
        Back to projects
      </Link>

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
            <h1 className="text-3xl font-bold mb-1">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <EditProjectDialog project={project} />
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
        </div>
      </div>

      <Separator className="mb-8" />

      <div className="ev-reveal" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Environments</h2>
          <CreateEnvironmentDialog projectId={projectId} />
        </div>

        {variablesByEnvironment.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Server className="size-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No environments yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Create your first environment to start adding variables.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {variablesByEnvironment.map(({ environment, variables }) => (
              <EnvironmentSection
                key={environment.id}
                environment={environment}
                variables={variables}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

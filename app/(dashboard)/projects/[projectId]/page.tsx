import { getProject } from "@/features/projects/actions";
import { getEnvironments } from "@/features/environments/actions";
import { getVariables } from "@/features/variables/actions";
import { CreateEnvironmentDialog } from "@/features/environments/create-environment-dialog";
import { EnvironmentSection } from "@/features/environments/environment-section";
import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import { ArrowLeft, Folder } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  const environments = await getEnvironments(projectId);

  const variablesByEnvironment = await Promise.all(
    environments.map(async (env) => ({
      environment: env,
      variables: await getVariables(env.id),
    }))
  );

  return (
    <div>
      <Button variant="ghost" size="sm" render={<Link href="/projects" />} className="mb-6">
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to projects
      </Button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Folder className="size-8 text-primary" />
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </div>

      <Separator className="mb-6" />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Environments</h2>
        <CreateEnvironmentDialog projectId={projectId} />
      </div>

      {variablesByEnvironment.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Folder className="size-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No environments yet</h3>
            <p className="text-muted-foreground text-center">
              Create your first environment to start adding variables.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {variablesByEnvironment.map(({ environment, variables }) => (
            <EnvironmentSection
              key={environment.id}
              environment={environment}
              variables={variables}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

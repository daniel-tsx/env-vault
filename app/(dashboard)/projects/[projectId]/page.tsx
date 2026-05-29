import { getProject } from "@/features/projects/actions";
import { getEnvironments } from "@/features/environments/actions";
import { getVariables } from "@/features/variables/actions";
import { CreateEnvironmentDialog } from "@/features/environments/create-environment-dialog";
import { EnvironmentSection } from "@/features/environments/environment-section";
import { DeleteProjectButton } from "@/features/projects/delete-project-button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <DeleteProjectButton projectId={project.id} projectName={project.name} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Environments</h2>
        <CreateEnvironmentDialog projectId={projectId} />
      </div>

      {variablesByEnvironment.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <h3 className="text-lg font-medium mb-2">No environments yet</h3>
          <p className="text-muted-foreground">
            Create your first environment to start adding variables.
          </p>
        </div>
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

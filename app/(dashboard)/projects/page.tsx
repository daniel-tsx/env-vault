import { getProjects } from "@/features/projects/actions";
import { CreateProjectDialog } from "@/features/projects/create-project-dialog";
import { ProjectList } from "@/features/projects/project-list";
import { Search } from "lucide-react";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const projects = await getProjects(params.search);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and their environment variables.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="mb-6">
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            name="search"
            defaultValue={params.search}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
      </div>

      <ProjectList projects={projects} />
    </div>
  );
}

import { getProjects } from "@/features/projects/actions";
import { ProjectsBoard } from "@/features/projects/projects-board";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const projects = await getProjects(params.search);

  return <ProjectsBoard initialProjects={projects} search={params.search} />;
}

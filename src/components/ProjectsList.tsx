"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectCard } from "./ProjectCard";
import { ProjectsListProps, Project } from "@/lib/types";

export default function ProjectsList({
  activeToken,
  data,
  searchTerm = "",
}: ProjectsListProps) {
  const filterProject = (project: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(term) ||
      project.id.toLowerCase().includes(term) ||
      (project.framework && project.framework.toLowerCase().includes(term))
    );
  };

  const sortProjects = (a: Project, b: Project) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  };

  const filteredPersonalProjects =
    data?.personal?.projects?.filter(filterProject).sort(sortProjects) || [];

  const filteredTeams =
    data?.teams
      ?.map((team) => ({
        ...team,
        projects: team.projects.filter(filterProject).sort(sortProjects),
      }))
      .filter((team) => team.projects.length > 0) || [];

  filteredTeams.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );

  const hasFilteredPersonalProjects = filteredPersonalProjects.length > 0;
  const hasFilteredTeamProjects = filteredTeams.length > 0;
  const totalProjects =
    filteredPersonalProjects.length +
    filteredTeams.reduce((acc, team) => acc + team.projects.length, 0);
  const noResults = searchTerm.length > 0 && totalProjects === 0;

  if (!hasFilteredPersonalProjects && !hasFilteredTeamProjects && !searchTerm) {
    return null;
  }

  return (
    <div className="pl-8 pr-8 pb-8 space-y-8">
      {searchTerm && (
        <div className="text-sm text-muted-foreground mt-2">
          {totalProjects} project{totalProjects !== 1 ? "s" : ""} found
        </div>
      )}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground mt-1">
            Try a different search term or clear your search
          </p>
        </div>
      )}
      {hasFilteredPersonalProjects && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Personal Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPersonalProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  activeToken={activeToken}
                  project={project}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {filteredTeams.map((team) => (
        <div key={team.id}>
          <h3 className="text-lg font-semibold mt-4 mb-2">Team: {team.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {team.projects.map((project) => (
              <ProjectCard
                key={project.id}
                activeToken={activeToken}
                project={project}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

interface Team {
  id: string;
  name: string;
  [key: string]: any;
}

interface Project {
  id: string;
  name: string;
  link?: {
    deployHooks?: Array<any>;
  };
  latestDeployments?: Array<Deployment>;
  [key: string]: any;
}

interface Deployment {
  id: string;
  [key: string]: any;
}

interface EnhancedDeployment extends Deployment {
  logs: Array<any>;
  buildError: boolean;
  errorLogs: Array<any>;
}

interface EnhancedProject extends Project {
  teamId: string | null;
  teamName: string | null;
  hooks: Array<any>;
  deployments: Array<EnhancedDeployment>;
}

interface LogEvent {
  level: string;
  [key: string]: any;
}

interface LogsResponse {
  events?: LogEvent[];
  [key: string]: any;
}

interface ProjectWithTeam {
  project: Project;
  teamId: string | null;
}

interface TeamProjects {
  team: Team;
  projects: Project[];
}

interface ApiResponse {
  personal: {
    projects: EnhancedProject[];
  };
  teams: Array<
    Team & {
      projects: EnhancedProject[];
    }
  >;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Extract token from the Authorization header
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization header is missing or invalid" },
      { status: 401 }
    );
  }

  // Extract the token from the header value
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    // 1. First, fetch all teams the user belongs to
    const teamsResponse = await fetch("https://api.vercel.com/v2/teams", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!teamsResponse.ok) {
      // Check for authentication errors specifically
      if (teamsResponse.status === 401 || teamsResponse.status === 403) {
        return NextResponse.json(
          { error: "Invalid or expired Vercel token" },
          { status: teamsResponse.status }
        );
      }
      throw new Error(`Failed to fetch teams: ${teamsResponse.status}`);
    }

    const teamsData = await teamsResponse.json();
    const teams: Team[] = teamsData.teams || [];

    // 2. Fetch personal projects
    const personalProjectsResponse = await fetch(
      "https://api.vercel.com/v9/projects",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!personalProjectsResponse.ok) {
      throw new Error(
        `Failed to fetch personal projects: ${personalProjectsResponse.status}`
      );
    }
    const personalProjectsData = await personalProjectsResponse.json();
    const personalProjects: Project[] = personalProjectsData.projects || [];

    // 3. Fetch projects for each team
    const teamProjectsPromises: Promise<TeamProjects>[] = teams.map(
      async (team) => {
        const teamProjectsResponse = await fetch(
          `https://api.vercel.com/v9/projects?teamId=${team.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!teamProjectsResponse.ok) {
          console.warn(`Failed to fetch projects for team ${team.name}`);
          return { team, projects: [] };
        }
        const teamProjectsData = await teamProjectsResponse.json();
        return { team, projects: teamProjectsData.projects || [] };
      }
    );
    const teamProjectsResults = await Promise.all(teamProjectsPromises);

    // 4. Prepare all projects (personal and team)
    const allProjects: ProjectWithTeam[] = [
      ...personalProjects.map((project) => ({ project, teamId: null })),
      ...teamProjectsResults.flatMap((result) =>
        result.projects.map((project) => ({ project, teamId: result.team.id }))
      ),
    ];

    // 5. Helper function to fetch deployment logs
    const fetchDeploymentLogs = async (
      deploymentId: string,
      teamId: string | null
    ) => {
      try {
        const url = teamId
          ? `https://api.vercel.com/v3/deployments/${deploymentId}/events?teamId=${teamId}`
          : `https://api.vercel.com/v3/deployments/${deploymentId}/events`;

        const logsResponse = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!logsResponse.ok) {
          console.warn(`Failed to fetch logs for deployment ${deploymentId}`);
          return { error: `Failed to fetch logs: ${logsResponse.status}` };
        }

        const logsData: LogsResponse = await logsResponse.json();

        // Check the structure of the response
        const events: LogEvent[] =
          logsData.events || (logsData as LogEvent[]) || [];

        // Extract errors from the logs
        const errors = events.filter((event) => event.level === "error");

        return {
          events: events,
          hasError: errors.length > 0,
          errors: errors,
        };
      } catch (error) {
        console.error(
          `Error fetching logs for deployment ${deploymentId}:`,
          error
        );
        return {
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch deployment logs",
          events: [],
          hasError: true,
          errors: [],
        };
      }
    };

    // 6. Process each project to get hooks, deployments, and logs
    const projectsWithDetailsPromises: Promise<EnhancedProject>[] =
      allProjects.map(async ({ project, teamId }) => {
        const hooks = project?.link?.deployHooks || [];
        const deployments = project?.latestDeployments || [];
        const enhancedDeployments: EnhancedDeployment[] = []; // Create a new array to store enhanced deployments

        // Fetch logs for each deployment
        if (deployments.length > 0) {
          for (const deployment of deployments) {
            const deploymentLogs = await fetchDeploymentLogs(
              deployment.id,
              teamId
            );

            // Create an enhanced deployment object and push it to our new array
            enhancedDeployments.push({
              ...deployment,
              logs: deploymentLogs.events || [],
              buildError: deploymentLogs.hasError || false,
              errorLogs: deploymentLogs.errors || [],
            });
          }
        }

        return {
          ...project,
          teamId,
          teamName: teamId
            ? teams.find((t) => t.id === teamId)?.name || null
            : null,
          hooks,
          deployments: enhancedDeployments, // Use the enhanced deployments array
        };
      });

    const projectsWithDetails = await Promise.all(projectsWithDetailsPromises);

    // 7. Organize results by account (personal and teams)
    const result: ApiResponse = {
      personal: {
        projects: projectsWithDetails.filter((p) => p.teamId === null),
      },
      teams: teams.map((team) => ({
        ...team,
        projects: projectsWithDetails.filter((p) => p.teamId === team.id),
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching Vercel resources:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Vercel resources",
      },
      { status: 500 }
    );
  }
}

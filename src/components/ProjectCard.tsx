"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  GitBranch,
  Clock,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Link,
  ExternalLink,
  CircleCheck,
} from "lucide-react";
import { combineErrorTexts } from "@/lib/utils";
import { SectionType, ProjectCardProps } from "@/lib/types";

export function ProjectCard({
  activeToken,
  project: initialProject,
}: ProjectCardProps) {
  const { toast } = useToast();
  const [project, setProject] = useState(initialProject);
  const [deploymentInProgress, setDeploymentInProgress] =
    useState<boolean>(false);
  const [showAllDeployments, setShowAllDeployments] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<SectionType>(null);
  const [activeDeploymentId, setActiveDeploymentId] = useState<string | null>(
    null
  );
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const displayedDeployments = showAllDeployments
    ? project.deployments
    : project.deployments.slice(0, 3);

  const hasRecentDeploymentError =
    project.deployments.length > 0 &&
    project.deployments[0]?.readyState === "ERROR";

  const isLatestDeploymentSuccessful =
    project.deployments.length > 0 &&
    project.deployments[0]?.readyState === "READY";

  const totalUrls = Object.values(project?.targets || {}).reduce(
    (count, target: any) => count + (target?.alias?.length || 0),
    0
  );

  useEffect(() => {
    checkForActiveDeployments();
  }, []);

  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  const toggleSection = (section: SectionType) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
    }
  };

  async function checkForActiveDeployments(): Promise<void> {
    if (project.deployments.length === 0) return;

    const latestDeployment = project.deployments[0];

    if (
      latestDeployment.readyState !== "READY" &&
      latestDeployment.readyState !== "ERROR"
    ) {
      setDeploymentInProgress(true);
      setActiveDeploymentId(latestDeployment.id);
      trackDeploymentProgress(project.teamId, project.id);
    }
  }

  async function triggerDeployment(
    url: string,
    projectId: string,
    teamId: string
  ): Promise<void> {
    setDeploymentInProgress(true);
    setDeploymentError(null);
    setActiveSection("deployments");

    try {
      const response = await fetch(`${url}`);
      if (!response.ok) throw new Error("Failed to trigger deployment");
      await response.json();

      const project = await fetch(
        `/api/vercel/project?projectId=${projectId}&teamId=${teamId}`,
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        }
      );
      const projectData = await project.json();
      const deploymentId = projectData.state.latestDeployments[0].id;
      setActiveDeploymentId(deploymentId);
      trackDeploymentProgress(teamId, projectId);
    } catch (error) {
      console.error("Error triggering deployment:", error);
      toast({
        title: "Error",
        description: "Failed to trigger deployment",
        variant: "destructive",
      });
      setDeploymentInProgress(false);
    }
  }

  async function refreshProjectData(
    teamId: string,
    projectId: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `/api/vercel/project?projectId=${projectId}&teamId=${teamId}`,
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh project data");
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
    } catch (error) {
      console.error("Error refreshing project data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh project data",
        variant: "destructive",
      });
    }
  }

  function trackDeploymentProgress(teamId: string, projectId: string): void {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/vercel/deployment-status?teamId=${teamId}&projectId=${projectId}`,
          {
            headers: { Authorization: `Bearer ${activeToken}` },
          }
        );
        if (!response.ok) return;

        const data = await response.json();
        const { state, errorMessage } = data;

        if (state === "ERROR") {
          clearInterval(interval);
          setDeploymentInProgress(false);
          setDeploymentError(
            errorMessage || "Deployment failed with no specific error message"
          );
          toast({
            title: "Deployment Failed",
            description: errorMessage || "Deployment failed",
            variant: "destructive",
          });

          await refreshProjectData(teamId, projectId);
        } else if (state === "READY") {
          clearInterval(interval);
          setDeploymentInProgress(false);
          setActiveDeploymentId(null);
          setDeploymentError(null);
          toast({
            title: "Deployment Successful",
            description: "Your deployment is now live",
            variant: "default",
          });

          await refreshProjectData(teamId, projectId);
        }
      } catch (error) {
        console.error("Error checking deployment status:", error);
        clearInterval(interval);
        setDeploymentInProgress(false);
        setActiveDeploymentId(null);
        setDeploymentError("Failed to track deployment status");
      }
    }, 5000);
  }

  return (
    <Card className="transition-all hover:shadow-md flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CardTitle className="text-lg">{project.name}</CardTitle>

            {isLatestDeploymentSuccessful && (
              <CircleCheck className="h-5 w-5 text-green-500 ml-2" />
            )}

            {hasRecentDeploymentError && (
              <AlertCircle className="h-5 w-5 text-red-500 ml-2" />
            )}
          </div>
          <Badge variant="outline">
            {project.framework || "Unknown Framework"}
          </Badge>
        </div>
        <CardDescription>
          <div className="text-xs text-gray-500 flex items-center">
            <span>ID: {project.id}</span>
          </div>
        </CardDescription>
      </CardHeader>

      {deploymentInProgress && (
        <div className="px-6">
          <div className="relative w-full h-2 bg-gray-200 overflow-hidden rounded-md mb-4">
            <div className="absolute left-0 w-full h-full bg-blue-500 animate-loading-progress" />
          </div>
          {activeDeploymentId && (
            <div className="text-xs text-gray-500 mb-2 text-center">
              Deploying... (ID: {activeDeploymentId.substring(0, 8)})
            </div>
          )}
        </div>
      )}

      {deploymentError && (
        <div className="px-6 mb-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-red-700 break-words">
              <div className="font-medium mb-1">Deployment Error:</div>
              {deploymentError}
            </div>
          </div>
        </div>
      )}

      <CardContent className="space-y-4 flex-grow">
        <div className="space-y-2 mt-4 mb-2">
          <h4 className="text-sm font-medium flex items-center">
            <GitBranch className="h-4 w-4 mr-2" />
            Deployment Hooks ({project.hooks.length})
          </h4>
          <div
            className={`grid gap-2 ${
              project.hooks.length === 1
                ? "grid-cols-1"
                : project.hooks.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {project.hooks.map((hook, index) => (
              <Button
                key={index}
                variant="secondary"
                onClick={() =>
                  triggerDeployment(hook.url, project.id, project.teamId)
                }
                disabled={deploymentInProgress}
              >
                Deploy {hook.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("urls")}
          >
            <h4 className="text-sm font-medium flex items-center">
              <Link className="h-4 w-4 mr-2" />
              Domains & URLs ({totalUrls})
              {activeSection === "urls" ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </h4>
          </div>

          {activeSection === "urls" && project?.targets && (
            <div className="space-y-2 mt-2">
              {Object.entries(project.targets).map(
                ([environment, target]: [string, any]) => (
                  <div key={environment} className="border rounded-md p-3">
                    <div className="font-medium text-sm mb-2 pb-1 border-b">
                      {environment === "production"
                        ? "Production"
                        : environment.charAt(0).toUpperCase() +
                          environment.slice(1)}
                    </div>
                    {target?.alias?.length > 0 ? (
                      <ul className="space-y-2">
                        {target.alias.map((url: string) => (
                          <li
                            key={url}
                            className="flex items-center justify-between group"
                          >
                            <a
                              href={`https://${url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 flex"
                            >
                              <div className="flex items-center mr-2">
                                <ExternalLink className="h-4 w-4 text-gray-500" />
                              </div>
                              <span className="text-sm">{url}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No domains available
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div
              className="flex w-full items-center cursor-pointer"
              onClick={() => toggleSection("deployments")}
            >
              <h4 className="text-sm w-full font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Recent Deployments
                {activeSection === "deployments" ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </h4>
            </div>
            {activeSection === "deployments" &&
              project.deployments.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllDeployments(!showAllDeployments)}
                >
                  {showAllDeployments ? "Show Less" : "Show All"}
                </Button>
              )}
          </div>

          {activeSection === "deployments" && (
            <ul className="space-y-2">
              {displayedDeployments.map((deployment) => {
                let errorStack = "";

                if (deployment?.errorLogs?.length > 0) {
                  errorStack = combineErrorTexts(deployment?.errorLogs);
                }

                return (
                  <li key={deployment.id} className="p-2 border rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium flex items-center">
                        <Activity className="h-3 w-3 mr-1" />
                        <span
                          className={`rounded-full h-2 w-2 mr-2 ${
                            deployment?.readyState === "READY"
                              ? "bg-green-500"
                              : deployment?.readyState === "ERROR"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        {deployment.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          deployment?.readyState === "ERROR"
                            ? "text-red-500 border-red-200 bg-red-50"
                            : deployment?.readyState === "READY"
                            ? "text-green-500 border-green-200 bg-green-50"
                            : ""
                        }`}
                      >
                        {deployment?.readyState}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between items-center">
                      <span>
                        {deployment?.meta?.githubCommitMessage ||
                          "No commit message"}
                      </span>
                      <span>
                        {new Date(deployment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {deployment?.readyState === "ERROR" && (
                      <div
                        className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100"
                        dangerouslySetInnerHTML={{ __html: errorStack }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 text-xs text-gray-500">
        Last updated:{" "}
        {displayedDeployments.length > 0
          ? new Date(displayedDeployments[0].createdAt).toLocaleString()
          : "N/A"}
      </CardFooter>
    </Card>
  );
}

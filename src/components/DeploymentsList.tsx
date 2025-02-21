"use client";

import { Badge } from "@/components/ui/badge";
import { GitBranch } from "lucide-react";
import { DeploymentsListProps } from "@/lib/types";

export function DeploymentsList({ deployments }: DeploymentsListProps) {
  if (deployments.length === 0) {
    return (
      <p className="text-muted-foreground text-sm italic pl-4">
        No recent deployments found
      </p>
    );
  }

  return (
    <ul className="space-y-2 pl-4 border-l border-green-100">
      {deployments.map((deployment) => (
        <li key={deployment.id} className="relative">
          <div className="absolute w-2 h-2 bg-green-200 rounded-full -left-5 top-2" />
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <GitBranch className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="font-medium line-clamp-1">
                  {deployment.meta?.githubCommitMessage ||
                    deployment.name ||
                    "Deployment"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(deployment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge
              variant={
                deployment.state === "READY"
                  ? "default"
                  : deployment.state === "ERROR"
                  ? "destructive"
                  : "outline"
              }
              className="ml-2"
            >
              {deployment.state}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}

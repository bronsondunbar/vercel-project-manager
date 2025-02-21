"use client";

import { Button } from "@/components/ui/button";
import { DeploymentHooksProps } from "@/lib/types";

export function DeploymentHooks({
  hooks,
  onTriggerDeployment,
}: DeploymentHooksProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <div className="w-1 h-5 bg-blue-500 rounded-full" />
        Deployment Hooks ({hooks.length})
      </h4>

      {hooks.length > 0 ? (
        <ul className="space-y-2 pl-4 border-l border-blue-100">
          {hooks.map((hook) => (
            <li key={hook.id} className="relative">
              <div className="absolute w-2 h-2 bg-blue-200 rounded-full -left-5 top-2" />
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-left justify-start font-medium hover:bg-transparent hover:text-blue-600"
                onClick={() => onTriggerDeployment(hook.url)}
              >
                {hook.name}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm italic pl-4">
          No deployment hooks found
        </p>
      )}
    </div>
  );
}

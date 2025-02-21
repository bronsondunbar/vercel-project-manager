export type SectionType = "urls" | "deployments" | null;
export interface VercelData {
  personal?: {
    projects: Project[];
  };
  teams?: Team[];
}

export interface Team {
  id: string;
  name: string;
  projects: Project[];
}

export interface Project {
  id: string;
  name: string;
  framework?: string;
  teamName?: string;
  teamId: string;
  hooks: DeploymentHook[];
  deployments: Deployment[];
  targets: Record<string, any>[];
}

export interface DeploymentHook {
  id: string;
  name: string;
  url: string;
}

export interface Deployment {
  id: string;
  name?: string;
  createdAt: string;
  state: "READY" | "ERROR" | "BUILDING" | "CANCELED" | "QUEUED";
  readyState?: string;
  meta?: {
    githubCommitMessage?: string;
  };
  logs: Record<string, any>[];
  buildError: boolean;
  errorLogs: Record<string, any>[];
}

export interface ToastProps {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

export interface AuthFormProps {
  supabase: any;
  toast: (props: ToastProps) => void;
  setLoading: (loading: boolean) => void;
}

export interface TokenFormProps {
  onSubmit: (token: string, name: string) => Promise<void>;
  onSignOut?: () => Promise<void>;
  onCancel?: () => void;
}

export interface ProjectsListProps {
  activeToken?: UserToken | null;
  data: VercelData | null;
  searchTerm?: string;
}

export interface ProjectCardProps {
  activeToken?: UserToken | null;
  project: Project;
}
export interface DeploymentHooksProps {
  hooks: DeploymentHook[];
  onTriggerDeployment: (url: string) => void;
}
export interface DeploymentsListProps {
  deployments: Deployment[];
}

export type UserToken = {
  id: string;
  token: string;
  name: string;
  created_at: string;
};

export interface HeaderProps {
  title: string;
  tokens: UserToken[];
  activeToken: UserToken | null;
  onTokenSwitch: (tokenId: string) => void;
  onTokenDelete: (tokenId: string) => void;
  onAddNewToken: () => void;
  onSignOut: () => void;
}

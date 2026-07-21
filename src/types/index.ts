export type UserRole = "MANAGER" | "EMPLOYEE" | "INNOVATOR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  specialization?: string;
  status: "ACTIVE" | "INACTIVE";
  projectsCount: number;
  joinedAt: string;
}

export type ProjectStatus = "ACTIVE" | "AT_RISK" | "COMPLETED" | "PLANNING";

export interface Project {
  id: string;
  name: string;
  description: string;
  domain: string;
  status: ProjectStatus;
  progress: number; // 0-100
  healthScore: number; // 0-100
  aiScore: number; // 0-100
  startDate: string;
  endDate: string;
  assignedEmployees: Pick<User, "id" | "name" | "avatarUrl">[];
  createdBy: string;
}

export interface Activity {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export type NotificationType = "info" | "success" | "warning" | "danger";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
}

export interface AIRecommendation {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: "RISK" | "PERFORMANCE" | "RESOURCE" | "TIMELINE";
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  atRiskProjects: number;
  totalEmployees: number;
  totalProjectsDelta: number;
  activeProjectsDelta: number;
  atRiskProjectsDelta: number;
  totalEmployeesDelta: number;
}

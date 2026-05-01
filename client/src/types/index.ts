export type MemberRole = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  projectId: string;
  assigneeId?: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
  creator?: Pick<User, 'id' | 'name' | 'email'>;
  project?: Pick<Project, 'id' | 'name'>;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: Pick<User, 'id' | 'name' | 'email'>;
  members: ProjectMember[];
  tasks?: Task[];
  _count?: { tasks: number };
}

export interface DashboardData {
  totalProjects: number;
  myTasks: number;
  overdueTasks: number;
  recentProjects: (Pick<Project, 'id' | 'name' | 'createdAt' | 'updatedAt' | 'owner'> & {
    _count: { tasks: number };
  })[];
  upcomingTasks: (Pick<Task, 'id' | 'title' | 'dueDate' | 'priority' | 'status'> & {
    project: Pick<Project, 'id' | 'name'>;
  })[];
  tasksByStatus: Record<TaskStatus, number>;
}

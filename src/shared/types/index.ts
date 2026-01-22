import type { Database, UserRole, TaskStatus, TaskPriority } from '@/shared/lib/database.types';

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Domain types
export type Profile = Tables<'profiles'>;
export type Project = Tables<'projects'>;
export type ProjectMember = Tables<'project_members'>;
export type Task = Tables<'tasks'>;
export type UserPresence = Tables<'user_presence'>;

// Extended types with relations
export interface TaskWithAssignee extends Task {
  assignee?: Profile | null;
  creator?: Profile;
}

export interface ProjectWithMembers extends Project {
  members?: (ProjectMember & { profile: Profile })[];
  owner?: Profile;
}

export interface ProjectMemberWithProfile extends ProjectMember {
  profile: Profile;
}

// UI State types
export interface Column {
  id: TaskStatus;
  title: string;
  tasks: TaskWithAssignee[];
}

export interface DragTask {
  id: string;
  status: TaskStatus;
}

// Permission types
export interface Permissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canAssignTasks: boolean;
}

// Export enums
export type { UserRole, TaskStatus, TaskPriority };

// Constants
export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
export const USER_ROLES: UserRole[] = ['admin', 'editor', 'viewer'];

export const COLUMN_TITLES: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done'
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-status-todo',
  in_progress: 'bg-status-in-progress',
  review: 'bg-status-review',
  done: 'bg-status-done'
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};

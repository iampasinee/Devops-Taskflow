export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  memberIds: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId?: string; // references User.id (deprecated)
  assigneeIds: string[]; // references User.id (multiple)
  priority: Priority;
  status: Status;
  deadline: string; // YYYY-MM-DD format
  commentCount: number;
  createdAt: string;
  order: number;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string; // references User.id
  body: string;
  createdAt: string;
}

export interface AppSettings {
  defaultView: 'board' | 'list';
  theme: 'light' | 'dark';
  defaultSort: 'deadline' | 'priority' | 'createdAt' | 'title';
}

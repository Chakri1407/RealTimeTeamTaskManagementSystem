import { Document, Model, Types } from 'mongoose';
import { UserRole, TaskStatus, TaskPriority, ActivityAction } from './enums';

// ============================================================================
// User Interfaces
// ============================================================================

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  teams: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
  // Static methods
  findByCredentials(email: string, password: string): Promise<IUser>;
}

export interface IUserPopulated extends Omit<IUser, 'teams'> {
  teams: ITeam[];
}

// ============================================================================
// Team Interfaces
// ============================================================================

export interface ITeamMember {
  user: Types.ObjectId;
  role: UserRole;
  joinedAt: Date;
}

export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  members: ITeamMember[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Virtual properties
  memberCount: number;

  // Instance methods
  isMember(userId: Types.ObjectId): boolean;
  isAdmin(userId: Types.ObjectId): boolean;
  getUserRole(userId: Types.ObjectId): UserRole | null;
}

export interface ITeamModel extends Model<ITeam> {
  // Static methods
  findByUser(userId: Types.ObjectId): Promise<ITeam[]>;
}

export interface ITeamPopulated extends Omit<ITeam, 'members' | 'createdBy'> {
  members: Array<{
    user: IUser;
    role: UserRole;
    joinedAt: Date;
  }>;
  createdBy: IUser;
}

// ============================================================================
// Project Interfaces
// ============================================================================

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  team: Types.ObjectId;
  createdBy: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;

  // Virtual properties
  duration: number | null;
}

export interface IProjectModel extends Model<IProject> {
  // Static methods
  findByTeam(teamId: Types.ObjectId): Promise<IProject[]>;
  findActive(): Promise<IProject[]>;
}

export interface IProjectPopulated extends Omit<IProject, 'team' | 'createdBy'> {
  team: ITeam;
  createdBy: IUser;
}

// ============================================================================
// Task Interfaces
// ============================================================================

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  project: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags: string[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;

  // Virtual properties
  isOverdue: boolean;
  daysUntilDue: number | null;

  // Instance methods
  canTransitionTo(newStatus: TaskStatus): boolean;
}

export interface ITaskModel extends Model<ITask> {
  // Static methods
  findByProject(projectId: Types.ObjectId): Promise<ITask[]>;
  findByAssignee(userId: Types.ObjectId): Promise<ITask[]>;
  findOverdue(): Promise<ITask[]>;
  findByStatus(projectId: Types.ObjectId, status: TaskStatus): Promise<ITask[]>;
}

export interface ITaskPopulated extends Omit<ITask, 'project' | 'assignedTo' | 'createdBy'> {
  project: IProject;
  assignedTo?: IUser;
  createdBy: IUser;
}

// ============================================================================
// Activity Log Interfaces
// ============================================================================

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  action: ActivityAction;
  user: Types.ObjectId;
  team?: Types.ObjectId;
  project?: Types.ObjectId;
  task?: Types.ObjectId;
  metadata?: Record<string, any>;
  description: string;
  createdAt: Date;
}

export interface IActivityLogModel extends Model<IActivityLog> {
  // Static methods
  createLog(logData: {
    action: ActivityAction;
    user: Types.ObjectId;
    description: string;
    team?: Types.ObjectId;
    project?: Types.ObjectId;
    task?: Types.ObjectId;
    metadata?: Record<string, any>;
  }): Promise<IActivityLog>;

  getTeamActivity(teamId: Types.ObjectId, limit?: number): Promise<IActivityLog[]>;
  getProjectActivity(projectId: Types.ObjectId, limit?: number): Promise<IActivityLog[]>;
  getUserActivity(userId: Types.ObjectId, limit?: number): Promise<IActivityLog[]>;
  getTaskHistory(taskId: Types.ObjectId): Promise<IActivityLog[]>;
  getActivityByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: {
      team?: Types.ObjectId;
      project?: Types.ObjectId;
      user?: Types.ObjectId;
    }
  ): Promise<IActivityLog[]>;
}

export interface IActivityLogPopulated
  extends Omit<IActivityLog, 'user' | 'team' | 'project' | 'task'> {
  user: IUser;
  team?: ITeam;
  project?: IProject;
  task?: ITask;
} 
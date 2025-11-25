import { Document, Types } from 'mongoose';
import { UserRole, TaskStatus, TaskPriority, ActivityAction } from './enums';

// User Interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  teams: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Team Member Interface
export interface ITeamMember {
  user: Types.ObjectId;
  role: UserRole;
  joinedAt: Date;
}

// Team Interface
export interface ITeam extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  members: ITeamMember[];
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Project Interface
export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  team: Types.ObjectId;
  createdBy: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task Interface
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
  tags?: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Activity Log Interface
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

// Populate Types
export interface IUserPopulated extends Omit<IUser, 'teams'> {
  teams: ITeam[];
}

export interface ITeamPopulated extends Omit<ITeam, 'members' | 'createdBy'> {
  members: Array<{
    user: IUser;
    role: UserRole;
    joinedAt: Date;
  }>;
  createdBy: IUser;
}

export interface IProjectPopulated extends Omit<IProject, 'team' | 'createdBy'> {
  team: ITeam;
  createdBy: IUser;
}

export interface ITaskPopulated extends Omit<ITask, 'project' | 'assignedTo' | 'createdBy'> {
  project: IProject;
  assignedTo?: IUser;
  createdBy: IUser;
}

export interface IActivityLogPopulated extends Omit<IActivityLog, 'user' | 'team' | 'project' | 'task'> {
  user: IUser;
  team?: ITeam;
  project?: IProject;
  task?: ITask;
} 
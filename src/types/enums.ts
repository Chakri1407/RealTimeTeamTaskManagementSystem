// User Role Enumeration
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

// Task Status Enumeration
export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
}

// Task Priority Enumeration
export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

// Activity Action Types
export enum ActivityAction {
  // User Actions
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
  
  // Team Actions
  TEAM_CREATED = 'team_created',
  TEAM_UPDATED = 'team_updated',
  TEAM_DELETED = 'team_deleted',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  MEMBER_ROLE_CHANGED = 'member_role_changed',
  
  // Project Actions
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',
  
  // Task Actions
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  TASK_STATUS_CHANGED = 'task_status_changed',
  TASK_ASSIGNED = 'task_assigned',
  TASK_UNASSIGNED = 'task_unassigned',
  TASK_PRIORITY_CHANGED = 'task_priority_changed',
} 
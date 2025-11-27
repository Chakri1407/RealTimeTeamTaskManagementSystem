/**
 * Socket.IO Event Constants
 * Defines all real-time events used in the application
 */

// ============================================================================
// Client -> Server Events (Events that clients emit)
// ============================================================================
export const CLIENT_EVENTS = {
  // Room Management
  JOIN_TEAM: 'join:team',
  LEAVE_TEAM: 'leave:team',
  JOIN_PROJECT: 'join:project',
  LEAVE_PROJECT: 'leave:project',
  
  // Task Events
  SUBSCRIBE_TASK: 'subscribe:task',
  UNSUBSCRIBE_TASK: 'unsubscribe:task',
} as const;

// ============================================================================
// Server -> Client Events (Events that server emits)
// ============================================================================
export const SERVER_EVENTS = {
  // Connection Events
  CONNECTED: 'connected',
  ERROR: 'error',
  
  // Team Events
  TEAM_CREATED: 'team:created',
  TEAM_UPDATED: 'team:updated',
  TEAM_DELETED: 'team:deleted',
  MEMBER_ADDED: 'team:member:added',
  MEMBER_REMOVED: 'team:member:removed',
  MEMBER_ROLE_CHANGED: 'team:member:role:changed',
  
  // Project Events
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  PROJECT_DELETED: 'project:deleted',
  
  // Task Events
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_STATUS_CHANGED: 'task:status:changed',
  TASK_ASSIGNED: 'task:assigned',
  TASK_UNASSIGNED: 'task:unassigned',
  
  // Activity Events
  ACTIVITY_LOG: 'activity:log',
  
  // Notification Events
  NOTIFICATION: 'notification',
} as const;

// ============================================================================
// Room Prefixes (for organizing socket rooms)
// ============================================================================
export const ROOM_PREFIX = {
  TEAM: 'team:',
  PROJECT: 'project:',
  USER: 'user:',
  TASK: 'task:',
} as const;

// ============================================================================
// Type Exports
// ============================================================================
export type ClientEvent = typeof CLIENT_EVENTS[keyof typeof CLIENT_EVENTS];
export type ServerEvent = typeof SERVER_EVENTS[keyof typeof SERVER_EVENTS];

// Payload types for server events
export interface TeamEventPayload {
  teamId: string;
  teamName: string;
  userId?: string;
  userName?: string;
  role?: string;
  timestamp: Date;
}

export interface ProjectEventPayload {
  projectId: string;
  projectName: string;
  teamId: string;
  userId: string;
  userName: string;
  status?: string;
  timestamp: Date;
}

export interface TaskEventPayload {
  taskId: string;
  taskTitle: string;
  projectId: string;
  teamId: string;
  userId: string;
  userName: string;
  assigneeId?: string;
  assigneeName?: string;
  status?: string;
  previousStatus?: string;
  priority?: string;
  timestamp: Date;
}

export interface NotificationPayload {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface ActivityPayload {
  action: string;
  description: string;
  userId: string;
  userName: string;
  teamId?: string;
  projectId?: string;
  taskId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}


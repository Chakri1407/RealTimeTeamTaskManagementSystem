import { Types } from 'mongoose';
import { getIO, isSocketInitialized } from '../socket';
import {
  SERVER_EVENTS,
  ROOM_PREFIX,
  TeamEventPayload,
  ProjectEventPayload,
  TaskEventPayload,
  ActivityPayload,
  NotificationPayload,
} from '../socket/events';
import logger from './logger';

/**
 * Socket Emitter Utility
 * Provides methods to emit real-time events to connected clients
 */
class SocketEmitter {
  /**
   * Safely get IO instance
   */
  private getIO() {
    if (!isSocketInitialized()) {
      logger.debug('Socket.IO not initialized, skipping emit');
      return null;
    }
    return getIO();
  }

  // ============================================================================
  // Team Events
  // ============================================================================

  /**
   * Emit team created event
   */
  emitTeamCreated(payload: TeamEventPayload) {
    const io = this.getIO();
    if (!io) return;

    // Notify the creator
    if (payload.userId) {
      io.to(`${ROOM_PREFIX.USER}${payload.userId}`).emit(SERVER_EVENTS.TEAM_CREATED, payload);
    }
    logger.debug(`Emitted ${SERVER_EVENTS.TEAM_CREATED} for team ${payload.teamId}`);
  }

  /**
   * Emit team updated event
   */
  emitTeamUpdated(payload: TeamEventPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.TEAM}${payload.teamId}`).emit(SERVER_EVENTS.TEAM_UPDATED, payload);
    logger.debug(`Emitted ${SERVER_EVENTS.TEAM_UPDATED} for team ${payload.teamId}`);
  }

  /**
   * Emit team deleted event
   */
  emitTeamDeleted(payload: TeamEventPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.TEAM}${payload.teamId}`).emit(SERVER_EVENTS.TEAM_DELETED, payload);
    logger.debug(`Emitted ${SERVER_EVENTS.TEAM_DELETED} for team ${payload.teamId}`);
  }

  /**
   * Emit member added event
   */
  emitMemberAdded(teamId: string, payload: TeamEventPayload) {
    const io = this.getIO();
    if (!io) return;

    // Notify team members
    io.to(`${ROOM_PREFIX.TEAM}${teamId}`).emit(SERVER_EVENTS.MEMBER_ADDED, payload);
    
    // Notify the new member directly
    if (payload.userId) {
      io.to(`${ROOM_PREFIX.USER}${payload.userId}`).emit(SERVER_EVENTS.NOTIFICATION, {
        type: 'info',
        title: 'Team Invitation',
        message: `You have been added to team: ${payload.teamName}`,
        data: { teamId },
        timestamp: new Date(),
      } as NotificationPayload);
    }
    logger.debug(`Emitted ${SERVER_EVENTS.MEMBER_ADDED} for team ${teamId}`);
  }

  /**
   * Emit member removed event
   */
  emitMemberRemoved(teamId: string, removedUserId: string, payload: TeamEventPayload) {
    const io = this.getIO();
    if (!io) return;

    // Notify team members
    io.to(`${ROOM_PREFIX.TEAM}${teamId}`).emit(SERVER_EVENTS.MEMBER_REMOVED, payload);
    
    // Notify the removed member
    io.to(`${ROOM_PREFIX.USER}${removedUserId}`).emit(SERVER_EVENTS.NOTIFICATION, {
      type: 'warning',
      title: 'Removed from Team',
      message: `You have been removed from team: ${payload.teamName}`,
      data: { teamId },
      timestamp: new Date(),
    } as NotificationPayload);
    logger.debug(`Emitted ${SERVER_EVENTS.MEMBER_REMOVED} for team ${teamId}`);
  }

  /**
   * Emit member role changed event
   */
  emitMemberRoleChanged(teamId: string, payload: TeamEventPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.TEAM}${teamId}`).emit(SERVER_EVENTS.MEMBER_ROLE_CHANGED, payload);
    
    // Notify the affected member
    if (payload.userId) {
      io.to(`${ROOM_PREFIX.USER}${payload.userId}`).emit(SERVER_EVENTS.NOTIFICATION, {
        type: 'info',
        title: 'Role Updated',
        message: `Your role in ${payload.teamName} has been changed to ${payload.role}`,
        data: { teamId, role: payload.role },
        timestamp: new Date(),
      } as NotificationPayload);
    }
    logger.debug(`Emitted ${SERVER_EVENTS.MEMBER_ROLE_CHANGED} for team ${teamId}`);
  }

  // ============================================================================
  // Project Events
  // ============================================================================

  /**
   * Emit project created event
   */
  emitProjectCreated(payload: ProjectEventPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.TEAM}${payload.teamId}`).emit(SERVER_EVENTS.PROJECT_CREATED, payload);
    logger.debug(`Emitted ${SERVER_EVENTS.PROJECT_CREATED} for project ${payload.projectId}`);
  }

  /**
   * Emit project updated event
   */
  emitProjectUpdated(payload: ProjectEventPayload) {
    const io = this.getIO();
    if (!io) return;

    // Notify team and project rooms
    io.to(`${ROOM_PREFIX.TEAM}${payload.teamId}`).emit(SERVER_EVENTS.PROJECT_UPDATED, payload);
    io.to(`${ROOM_PREFIX.PROJECT}${payload.projectId}`).emit(SERVER_EVENTS.PROJECT_UPDATED, payload);
    logger.debug(`Emitted ${SERVER_EVENTS.PROJECT_UPDATED} for project ${payload.projectId}`);
  }

  /**
   * Emit project deleted event
   */
  emitProjectDeleted(payload: ProjectEventPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.TEAM}${payload.teamId}`).emit(SERVER_EVENTS.PROJECT_DELETED, payload);
    io.to(`${ROOM_PREFIX.PROJECT}${payload.projectId}`).emit(SERVER_EVENTS.PROJECT_DELETED, payload);
    logger.debug(`Emitted ${SERVER_EVENTS.PROJECT_DELETED} for project ${payload.projectId}`);
  }

  // ============================================================================
  // Task Events
  // ============================================================================

  /**
   * Emit task created event
   */
  emitTaskCreated(payload: TaskEventPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.PROJECT}${payload.projectId}`).emit(SERVER_EVENTS.TASK_CREATED, payload);
    
    // Notify assignee if task is assigned
    if (payload.assigneeId) {
      io.to(`${ROOM_PREFIX.USER}${payload.assigneeId}`).emit(SERVER_EVENTS.NOTIFICATION, {
        type: 'info',
        title: 'New Task Assigned',
        message: `You have been assigned to: ${payload.taskTitle}`,
        data: { taskId: payload.taskId, projectId: payload.projectId },
        timestamp: new Date(),
      } as NotificationPayload);
    }
    logger.debug(`Emitted ${SERVER_EVENTS.TASK_CREATED} for task ${payload.taskId}`);
  }

  /**
   * Emit task updated event
   */
  emitTaskUpdated(payload: TaskEventPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.PROJECT}${payload.projectId}`).emit(SERVER_EVENTS.TASK_UPDATED, payload);
    io.to(`${ROOM_PREFIX.TASK}${payload.taskId}`).emit(SERVER_EVENTS.TASK_UPDATED, payload);
    logger.debug(`Emitted ${SERVER_EVENTS.TASK_UPDATED} for task ${payload.taskId}`);
  }

  /**
   * Emit task deleted event
   */
  emitTaskDeleted(payload: TaskEventPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.PROJECT}${payload.projectId}`).emit(SERVER_EVENTS.TASK_DELETED, payload);
    io.to(`${ROOM_PREFIX.TASK}${payload.taskId}`).emit(SERVER_EVENTS.TASK_DELETED, payload);
    logger.debug(`Emitted ${SERVER_EVENTS.TASK_DELETED} for task ${payload.taskId}`);
  }

  /**
   * Emit task status changed event
   */
  emitTaskStatusChanged(payload: TaskEventPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.PROJECT}${payload.projectId}`).emit(SERVER_EVENTS.TASK_STATUS_CHANGED, payload);
    io.to(`${ROOM_PREFIX.TASK}${payload.taskId}`).emit(SERVER_EVENTS.TASK_STATUS_CHANGED, payload);
    
    // Notify assignee about status change
    if (payload.assigneeId && payload.assigneeId !== payload.userId) {
      io.to(`${ROOM_PREFIX.USER}${payload.assigneeId}`).emit(SERVER_EVENTS.NOTIFICATION, {
        type: 'info',
        title: 'Task Status Changed',
        message: `"${payload.taskTitle}" status changed to ${payload.status}`,
        data: { taskId: payload.taskId, status: payload.status },
        timestamp: new Date(),
      } as NotificationPayload);
    }
    logger.debug(`Emitted ${SERVER_EVENTS.TASK_STATUS_CHANGED} for task ${payload.taskId}`);
  }

  /**
   * Emit task assigned event
   */
  emitTaskAssigned(payload: TaskEventPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.PROJECT}${payload.projectId}`).emit(SERVER_EVENTS.TASK_ASSIGNED, payload);
    io.to(`${ROOM_PREFIX.TASK}${payload.taskId}`).emit(SERVER_EVENTS.TASK_ASSIGNED, payload);
    
    // Notify the new assignee
    if (payload.assigneeId) {
      io.to(`${ROOM_PREFIX.USER}${payload.assigneeId}`).emit(SERVER_EVENTS.NOTIFICATION, {
        type: 'info',
        title: 'Task Assigned',
        message: `You have been assigned to: ${payload.taskTitle}`,
        data: { taskId: payload.taskId, projectId: payload.projectId },
        timestamp: new Date(),
      } as NotificationPayload);
    }
    logger.debug(`Emitted ${SERVER_EVENTS.TASK_ASSIGNED} for task ${payload.taskId}`);
  }

  /**
   * Emit task unassigned event
   */
  emitTaskUnassigned(payload: TaskEventPayload & { previousAssigneeId?: string }) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.PROJECT}${payload.projectId}`).emit(SERVER_EVENTS.TASK_UNASSIGNED, payload);
    io.to(`${ROOM_PREFIX.TASK}${payload.taskId}`).emit(SERVER_EVENTS.TASK_UNASSIGNED, payload);
    
    // Notify the previous assignee
    if (payload.previousAssigneeId) {
      io.to(`${ROOM_PREFIX.USER}${payload.previousAssigneeId}`).emit(SERVER_EVENTS.NOTIFICATION, {
        type: 'info',
        title: 'Task Unassigned',
        message: `You have been unassigned from: ${payload.taskTitle}`,
        data: { taskId: payload.taskId },
        timestamp: new Date(),
      } as NotificationPayload);
    }
    logger.debug(`Emitted ${SERVER_EVENTS.TASK_UNASSIGNED} for task ${payload.taskId}`);
  }

  // ============================================================================
  // Activity Events
  // ============================================================================

  /**
   * Emit activity log event
   */
  emitActivityLog(teamId: string, projectId: string | undefined, payload: ActivityPayload) {
    const io = this.getIO();
    if (!io) return;

    // Emit to team room
    io.to(`${ROOM_PREFIX.TEAM}${teamId}`).emit(SERVER_EVENTS.ACTIVITY_LOG, payload);
    
    // Also emit to project room if applicable
    if (projectId) {
      io.to(`${ROOM_PREFIX.PROJECT}${projectId}`).emit(SERVER_EVENTS.ACTIVITY_LOG, payload);
    }
    logger.debug(`Emitted ${SERVER_EVENTS.ACTIVITY_LOG} for team ${teamId}`);
  }

  // ============================================================================
  // Direct Notifications
  // ============================================================================

  /**
   * Send notification to specific user
   */
  notifyUser(userId: string | Types.ObjectId, notification: NotificationPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.USER}${userId.toString()}`).emit(SERVER_EVENTS.NOTIFICATION, notification);
    logger.debug(`Sent notification to user ${userId}`);
  }

  /**
   * Broadcast notification to team
   */
  notifyTeam(teamId: string | Types.ObjectId, notification: NotificationPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.TEAM}${teamId.toString()}`).emit(SERVER_EVENTS.NOTIFICATION, notification);
    logger.debug(`Sent notification to team ${teamId}`);
  }

  /**
   * Broadcast notification to project
   */
  notifyProject(projectId: string | Types.ObjectId, notification: NotificationPayload) {
    const io = this.getIO();
    if (!io) return;

    io.to(`${ROOM_PREFIX.PROJECT}${projectId.toString()}`).emit(SERVER_EVENTS.NOTIFICATION, notification);
    logger.debug(`Sent notification to project ${projectId}`);
  }
}

// Export singleton instance
export const socketEmitter = new SocketEmitter();
export default socketEmitter;


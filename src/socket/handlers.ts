import { Socket, Server } from 'socket.io';
import { Types } from 'mongoose';
import { CLIENT_EVENTS, SERVER_EVENTS, ROOM_PREFIX } from './events';
import { Team, Project } from '../models';
import jwtUtil from '../utils/jwt';
import logger from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userName?: string;
}

/**
 * Authenticate socket connection using JWT
 */
export const authenticateSocket = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwtUtil.verifyAccessToken(token);
    
    // Attach user info to socket
    socket.userId = decoded.userId;
    socket.userEmail = decoded.email;

    logger.info(`Socket authenticated: ${decoded.email}`);
    next();
  } catch (error: any) {
    logger.error(`Socket authentication failed: ${error.message}`);
    next(new Error('Invalid token'));
  }
};

/**
 * Register all socket event handlers
 */
export const registerHandlers = (_io: Server, socket: AuthenticatedSocket) => {
  const userId = socket.userId!;

  // Join user's personal room for direct notifications
  socket.join(`${ROOM_PREFIX.USER}${userId}`);
  logger.debug(`User ${userId} joined personal room`);

  // ============================================================================
  // Team Room Handlers
  // ============================================================================

  /**
   * Join a team room to receive team updates
   */
  socket.on(CLIENT_EVENTS.JOIN_TEAM, async (teamId: string) => {
    try {
      if (!Types.ObjectId.isValid(teamId)) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Invalid team ID' });
        return;
      }

      // Verify user is team member
      const team = await Team.findById(teamId);
      if (!team) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Team not found' });
        return;
      }

      const isMember = team.members.some(
        (member) => member.user.toString() === userId
      );

      if (!isMember) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Not a team member' });
        return;
      }

      const roomName = `${ROOM_PREFIX.TEAM}${teamId}`;
      socket.join(roomName);
      logger.debug(`User ${userId} joined team room: ${roomName}`);

      socket.emit(SERVER_EVENTS.NOTIFICATION, {
        type: 'success',
        title: 'Joined Team',
        message: `Connected to team: ${team.name}`,
        timestamp: new Date(),
      });
    } catch (error: any) {
      logger.error(`Error joining team room: ${error.message}`);
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Failed to join team room' });
    }
  });

  /**
   * Leave a team room
   */
  socket.on(CLIENT_EVENTS.LEAVE_TEAM, (teamId: string) => {
    const roomName = `${ROOM_PREFIX.TEAM}${teamId}`;
    socket.leave(roomName);
    logger.debug(`User ${userId} left team room: ${roomName}`);
  });

  // ============================================================================
  // Project Room Handlers
  // ============================================================================

  /**
   * Join a project room to receive project updates
   */
  socket.on(CLIENT_EVENTS.JOIN_PROJECT, async (projectId: string) => {
    try {
      if (!Types.ObjectId.isValid(projectId)) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Invalid project ID' });
        return;
      }

      // Verify user has access to project via team membership
      const project = await Project.findById(projectId).populate('team');
      if (!project) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Project not found' });
        return;
      }

      const team = await Team.findById(project.team);
      if (!team) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Team not found' });
        return;
      }

      const isMember = team.members.some(
        (member) => member.user.toString() === userId
      );

      if (!isMember) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Not a project member' });
        return;
      }

      const roomName = `${ROOM_PREFIX.PROJECT}${projectId}`;
      socket.join(roomName);
      logger.debug(`User ${userId} joined project room: ${roomName}`);

      socket.emit(SERVER_EVENTS.NOTIFICATION, {
        type: 'success',
        title: 'Joined Project',
        message: `Connected to project: ${project.name}`,
        timestamp: new Date(),
      });
    } catch (error: any) {
      logger.error(`Error joining project room: ${error.message}`);
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Failed to join project room' });
    }
  });

  /**
   * Leave a project room
   */
  socket.on(CLIENT_EVENTS.LEAVE_PROJECT, (projectId: string) => {
    const roomName = `${ROOM_PREFIX.PROJECT}${projectId}`;
    socket.leave(roomName);
    logger.debug(`User ${userId} left project room: ${roomName}`);
  });

  // ============================================================================
  // Task Subscription Handlers
  // ============================================================================

  /**
   * Subscribe to task updates
   */
  socket.on(CLIENT_EVENTS.SUBSCRIBE_TASK, (taskId: string) => {
    if (!Types.ObjectId.isValid(taskId)) {
      socket.emit(SERVER_EVENTS.ERROR, { message: 'Invalid task ID' });
      return;
    }

    const roomName = `${ROOM_PREFIX.TASK}${taskId}`;
    socket.join(roomName);
    logger.debug(`User ${userId} subscribed to task: ${taskId}`);
  });

  /**
   * Unsubscribe from task updates
   */
  socket.on(CLIENT_EVENTS.UNSUBSCRIBE_TASK, (taskId: string) => {
    const roomName = `${ROOM_PREFIX.TASK}${taskId}`;
    socket.leave(roomName);
    logger.debug(`User ${userId} unsubscribed from task: ${taskId}`);
  });

  // ============================================================================
  // Disconnect Handler
  // ============================================================================

  socket.on('disconnect', (reason) => {
    logger.info(`Socket disconnected: ${userId} - Reason: ${reason}`);
  });

  // Send connection success message
  socket.emit(SERVER_EVENTS.CONNECTED, {
    message: 'Connected to real-time server',
    userId,
    timestamp: new Date(),
  });
};


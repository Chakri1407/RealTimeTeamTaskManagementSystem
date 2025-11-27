import { Server as HttpServer } from 'http';
import { Server, ServerOptions } from 'socket.io';
import config from '../config/config';
import logger from '../utils/logger';
import { authenticateSocket, registerHandlers } from './handlers';

// Export event types for external use
export * from './events';

// Socket.IO server instance
let io: Server | null = null;

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  const options: Partial<ServerOptions> = {
    cors: {
      origin: config.cors.allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  };

  io = new Server(httpServer, options);

  // Apply authentication middleware
  io.use(authenticateSocket);

  // Handle new connections
  io.on('connection', (socket) => {
    logger.info(`New socket connection: ${socket.id}`);
    registerHandlers(io!, socket);
  });

  logger.info('Socket.IO server initialized');

  return io;
};

/**
 * Get the Socket.IO server instance
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Check if Socket.IO is initialized
 */
export const isSocketInitialized = (): boolean => {
  return io !== null;
};

/**
 * Close Socket.IO server
 */
export const closeSocket = (): Promise<void> => {
  return new Promise((resolve) => {
    if (io) {
      io.close(() => {
        logger.info('Socket.IO server closed');
        io = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
};

export default {
  initializeSocket,
  getIO,
  isSocketInitialized,
  closeSocket,
};


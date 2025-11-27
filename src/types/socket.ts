import { Socket } from 'socket.io';

/**
 * Extended Socket interface with authentication data
 */
export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userName?: string;
}

/**
 * Socket connection data sent on successful authentication
 */
export interface SocketConnectionData {
  message: string;
  userId: string;
  timestamp: Date;
}

/**
 * Socket error response
 */
export interface SocketErrorResponse {
  message: string;
  code?: string;
}


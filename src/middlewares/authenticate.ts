import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import jwt from '../utils/jwt';
import { User } from '../models';
import { asyncHandler } from '../utils/asyncHandler';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = jwt.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    try {
      // Verify token
      const decoded = jwt.verifyAccessToken(token);

      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Attach user to request
      req.user = user;

      next();
    } catch (error: any) {
      throw new UnauthorizedError(error.message || 'Invalid token');
    }
  }
);

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't throw error if no token
 */
export const optionalAuthenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = jwt.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = jwt.verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select('-password');

        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Silently fail for optional auth
      }
    }

    next();
  }
); 
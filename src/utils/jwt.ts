import jwt from 'jsonwebtoken';
import config from '../config/config';
import { Types } from 'mongoose';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class JwtUtil {
  /**
   * Generate access token
   */
  generateAccessToken(userId: Types.ObjectId, email: string, role: string): string {
    const payload: JwtPayload = {
      userId: userId.toString(),
      email,
      role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as any);
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId: Types.ObjectId, email: string, role: string): string {
    const payload: JwtPayload = {
      userId: userId.toString(),
      email,
      role,
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as any);
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(userId: Types.ObjectId, email: string, role: string): TokenPair {
    return {
      accessToken: this.generateAccessToken(userId, email, role),
      refreshToken: this.generateRefreshToken(userId, email, role),
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw new Error('Refresh token verification failed');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get token from Authorization header
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}

// Create instance
const jwtUtil = new JwtUtil();

// Export as default
export default jwtUtil;

// Also export the instance as a named export for consistency
export { jwtUtil }; 
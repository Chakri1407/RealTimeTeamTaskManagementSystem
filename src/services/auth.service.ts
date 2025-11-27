import { Types } from 'mongoose';
import { User, ActivityLog } from '../models';
import { UnauthorizedError, ConflictError, BadRequestError } from '../utils/errors';
import jwtUtil from '../utils/jwt';
import type { TokenPair } from '../utils/jwt';
import { ActivityAction } from '../types/enums';

class AuthService {
  /**
   * Register a new user
   */
  async register(name: string, email: string, password: string): Promise<{
    user: {
      id: Types.ObjectId;
      name: string;
      email: string;
      role: string;
    };
    tokens: TokenPair;
  }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate tokens
    const tokens = jwtUtil.generateTokenPair(user._id, user.email, user.role);

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.USER_REGISTERED,
      user: user._id,
      description: `User ${user.name} registered`,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{
    user: {
      id: Types.ObjectId;
      name: string;
      email: string;
      role: string;
    };
    tokens: TokenPair;
  }> {
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const tokens = jwtUtil.generateTokenPair(user._id, user.email, user.role);

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.USER_LOGIN,
      user: user._id,
      description: `User ${user.name} logged in`,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwtUtil.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Generate new access token
      const accessToken = jwtUtil.generateAccessToken(user._id, user.email, user.role);

      return {
        accessToken,
      };
    } catch (error: any) {
      throw new UnauthorizedError(error.message || 'Invalid refresh token');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: Types.ObjectId) {
    const user = await User.findById(userId).populate('teams', 'name description');

    if (!user) {
      throw new BadRequestError('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: Types.ObjectId, updates: { name?: string }) {
    const user = await User.findById(userId);

    if (!user) {
      throw new BadRequestError('User not found');
    }

    if (updates.name) {
      user.name = updates.name;
    }

    await user.save();

    return user;
  }
}

export default new AuthService(); 
import { Request, Response } from 'express';
import { authService } from '../services';
import { asyncHandler, response } from '../utils';

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const result = await authService.register(name, email, password);

    return response.created(res, 'User registered successfully', result);
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return response.success(res, 'Login successful', result);
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    return response.success(res, 'Token refreshed successfully', result);
  });

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;

    const user = await authService.getProfile(userId);

    return response.success(res, 'Profile retrieved successfully', user);
  });

  /**
   * Update user profile
   * PUT /api/auth/me
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const updates = req.body;

    const user = await authService.updateProfile(userId, updates);

    return response.success(res, 'Profile updated successfully', user);
  });
}

export default new AuthController(); 
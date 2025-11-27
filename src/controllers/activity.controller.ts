import { Request, Response } from 'express';
import { activityService } from '../services';
import { asyncHandler, response } from '../utils';
import { Types } from 'mongoose';

class ActivityController {
  /**
   * Get team activity logs
   * GET /api/teams/:teamId/activity
   */
  getTeamActivity = asyncHandler(async (req: Request, res: Response) => {
    const teamId = new Types.ObjectId(req.params.teamId);
    const userId = req.user._id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const activities = await activityService.getTeamActivity(teamId, userId, limit);

    return response.success(res, 'Team activity retrieved successfully', activities);
  });

  /**
   * Get project activity logs
   * GET /api/projects/:projectId/activity
   */
  getProjectActivity = asyncHandler(async (req: Request, res: Response) => {
    const projectId = new Types.ObjectId(req.params.projectId);
    const userId = req.user._id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const activities = await activityService.getProjectActivity(projectId, userId, limit);

    return response.success(res, 'Project activity retrieved successfully', activities);
  });

  /**
   * Get user's own activity logs
   * GET /api/activity/me
   */
  getUserActivity = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const activities = await activityService.getUserActivity(userId, limit);

    return response.success(res, 'Your activity retrieved successfully', activities);
  });

  /**
   * Get task activity history
   * GET /api/tasks/:taskId/activity
   */
  getTaskHistory = asyncHandler(async (req: Request, res: Response) => {
    const taskId = new Types.ObjectId(req.params.taskId);
    const userId = req.user._id;

    const activities = await activityService.getTaskHistory(taskId, userId);

    return response.success(res, 'Task history retrieved successfully', activities);
  });

  /**
   * Get activity by date range
   * GET /api/activity/range
   */
  getActivityByDateRange = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { startDate, endDate, team, project } = req.query;

    if (!startDate || !endDate) {
      return response.error(res, 'Start date and end date are required', 400);
    }

    const filters: {
      team?: Types.ObjectId;
      project?: Types.ObjectId;
    } = {};

    if (team) filters.team = new Types.ObjectId(team as string);
    if (project) filters.project = new Types.ObjectId(project as string);

    const activities = await activityService.getActivityByDateRange(
      new Date(startDate as string),
      new Date(endDate as string),
      userId,
      filters
    );

    return response.success(res, 'Activity retrieved successfully', activities);
  });
}

export default new ActivityController(); 
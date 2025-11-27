import { Types } from 'mongoose';
import { ActivityLog, Team, Project } from '../models';
import { NotFoundError, ForbiddenError } from '../utils/errors';

class ActivityService {
  /**
   * Get team activity logs
   */
  async getTeamActivity(teamId: Types.ObjectId, userId: Types.ObjectId, limit: number = 50) {
    // Verify team exists and user is member
    const team = await Team.findById(teamId);
    if (!team) {
      throw new NotFoundError('Team not found');
    }

    if (!team.isMember(userId)) {
      throw new ForbiddenError('You must be a team member to view activity');
    }

    const activities = await ActivityLog.getTeamActivity(teamId, limit);

    return activities;
  }

  /**
   * Get project activity logs
   */
  async getProjectActivity(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
    limit: number = 50
  ) {
    // Verify project exists and user has access
    const project = await Project.findById(projectId).populate('team');
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const team = await Team.findById(project.team);
    if (!team || !team.isMember(userId)) {
      throw new ForbiddenError('You do not have access to this project');
    }

    const activities = await ActivityLog.getProjectActivity(projectId, limit);

    return activities;
  }

  /**
   * Get user's own activity logs
   */
  async getUserActivity(userId: Types.ObjectId, limit: number = 50) {
    const activities = await ActivityLog.getUserActivity(userId, limit);

    return activities;
  }

  /**
   * Get task activity history
   */
  async getTaskHistory(taskId: Types.ObjectId, userId: Types.ObjectId) {
    // Import Task here to avoid circular dependency
    const { Task } = await import('../models');

    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Verify user has access
    const project = await Project.findById(task.project);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const team = await Team.findById(project.team);
    if (!team || !team.isMember(userId)) {
      throw new ForbiddenError('You do not have access to this task');
    }

    const activities = await ActivityLog.getTaskHistory(taskId);

    return activities;
  }

  /**
   * Get activity by date range
   */
  async getActivityByDateRange(
    startDate: Date,
    endDate: Date,
    userId: Types.ObjectId,
    filters?: {
      team?: Types.ObjectId;
      project?: Types.ObjectId;
    }
  ) {
    // If team filter, verify user is member
    if (filters?.team) {
      const team = await Team.findById(filters.team);
      if (!team) {
        throw new NotFoundError('Team not found');
      }

      if (!team.isMember(userId)) {
        throw new ForbiddenError('You must be a team member to view activity');
      }
    }

    // If project filter, verify user has access
    if (filters?.project) {
      const project = await Project.findById(filters.project).populate('team');
      if (!project) {
        throw new NotFoundError('Project not found');
      }

      const team = await Team.findById(project.team);
      if (!team || !team.isMember(userId)) {
        throw new ForbiddenError('You do not have access to this project');
      }
    }

    const activities = await ActivityLog.getActivityByDateRange(startDate, endDate, {
      team: filters?.team,
      project: filters?.project,
      user: userId,
    });

    return activities;
  }
}

export default new ActivityService(); 
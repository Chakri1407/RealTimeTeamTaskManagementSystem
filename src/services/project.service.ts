import { Types } from 'mongoose';
import { Project, Team, ActivityLog } from '../models';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { ActivityAction } from '../types/enums';

// Define project status type
type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

class ProjectService {
  /**
   * Create a new project
   */
  async createProject(
    name: string,
    description: string | undefined,
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
    startDate?: Date,
    endDate?: Date,
    status?: string
  ) {
    // Verify team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      throw new NotFoundError('Team not found');
    }

    if (!team.isMember(userId)) {
      throw new ForbiddenError('You must be a team member to create projects');
    }

    // Validate and set status
    const validStatuses: ProjectStatus[] = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];
    const projectStatus: ProjectStatus = (status && validStatuses.includes(status as ProjectStatus))
      ? status as ProjectStatus
      : 'Planning';

    // Create project
    const project = await Project.create({
      name,
      description,
      team: teamId,
      createdBy: userId,
      startDate,
      endDate,
      status: projectStatus,
    });

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.PROJECT_CREATED,
      user: userId,
      team: teamId,
      project: project._id,
      description: `Project "${name}" created`,
    });

    return project;
  }

  /**
   * Get all projects for a team
   */
  async getTeamProjects(teamId: Types.ObjectId, userId: Types.ObjectId) {
    // Verify user is team member
    const team = await Team.findById(teamId);
    if (!team) {
      throw new NotFoundError('Team not found');
    }

    if (!team.isMember(userId)) {
      throw new ForbiddenError('You must be a team member to view projects');
    }

    const projects = await Project.find({ team: teamId })
      .populate('createdBy', 'name email')
      .populate('team', 'name')
      .sort({ createdAt: -1 });

    return projects;
  }

  /**
   * Get all projects user has access to
   */
  async getUserProjects(userId: Types.ObjectId) {
    // Get all teams user is member of
    const teams = await Team.find({ 'members.user': userId });
    const teamIds = teams.map((t) => t._id);

    // Get all projects from those teams
    const projects = await Project.find({ team: { $in: teamIds } })
      .populate('createdBy', 'name email')
      .populate('team', 'name')
      .sort({ createdAt: -1 });

    return projects;
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId: Types.ObjectId, userId: Types.ObjectId) {
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('team', 'name description');

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Verify user is team member
    const team = await Team.findById(project.team);
    if (!team || !team.isMember(userId)) {
      throw new ForbiddenError('You do not have access to this project');
    }

    return project;
  }

  /**
   * Update project
   */
  async updateProject(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
    updates: {
      name?: string;
      description?: string;
      startDate?: Date;
      endDate?: Date;
      status?: string;
    }
  ) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Verify user is team member
    const team = await Team.findById(project.team);
    if (!team || !team.isMember(userId)) {
      throw new ForbiddenError('You do not have access to this project');
    }

    // Update fields
    if (updates.name) project.name = updates.name;
    if (updates.description !== undefined) project.description = updates.description;
    if (updates.startDate) project.startDate = updates.startDate;
    if (updates.endDate) project.endDate = updates.endDate;
    
    // Validate and update status
    if (updates.status) {
      const validStatuses: ProjectStatus[] = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];
      if (validStatuses.includes(updates.status as ProjectStatus)) {
        project.status = updates.status as ProjectStatus;
      }
    }

    await project.save();

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.PROJECT_UPDATED,
      user: userId,
      team: project.team,
      project: project._id,
      description: `Project "${project.name}" updated`,
    });

    return project;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: Types.ObjectId, userId: Types.ObjectId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Verify user is team admin or project creator
    const team = await Team.findById(project.team);
    if (!team) {
      throw new NotFoundError('Team not found');
    }

    const isAdmin = team.isAdmin(userId);
    const isCreator = project.createdBy.toString() === userId.toString();

    if (!isAdmin && !isCreator) {
      throw new ForbiddenError('Only team admins or project creator can delete projects');
    }

    // Log activity before deletion
    await ActivityLog.createLog({
      action: ActivityAction.PROJECT_DELETED,
      user: userId,
      team: project.team,
      project: project._id,
      description: `Project "${project.name}" deleted`,
    });

    await project.deleteOne();

    return { message: 'Project deleted successfully' };
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectId: Types.ObjectId, userId: Types.ObjectId) {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Verify user is team member
    const team = await Team.findById(project.team);
    if (!team || !team.isMember(userId)) {
      throw new ForbiddenError('You do not have access to this project');
    }

    // Import Task model here to avoid circular dependency
    const { Task } = await import('../models');

    // Get task statistics
    const totalTasks = await Task.countDocuments({ project: projectId });
    const completedTasks = await Task.countDocuments({
      project: projectId,
      status: 'Done',
    });
    const inProgressTasks = await Task.countDocuments({
      project: projectId,
      status: 'In Progress',
    });
    const todoTasks = await Task.countDocuments({
      project: projectId,
      status: 'To Do',
    });
    const reviewTasks = await Task.countDocuments({
      project: projectId,
      status: 'Review',
    });

    return {
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks,
        review: reviewTasks,
        completionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    };
  }
}

export default new ProjectService(); 
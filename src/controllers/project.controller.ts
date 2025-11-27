import { Request, Response } from 'express';
import { projectService } from '../services';
import { asyncHandler, response } from '../utils';
import { Types } from 'mongoose';

class ProjectController {
  /**
   * Create a new project
   * POST /api/projects
   */
  createProject = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, team, startDate, endDate, status } = req.body;
    const userId = req.user._id;

    const project = await projectService.createProject(
      name,
      description,
      new Types.ObjectId(team),
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      status
    );

    return response.created(res, 'Project created successfully', project);
  });

  /**
   * Get all projects for a team
   * GET /api/teams/:teamId/projects
   */
  getTeamProjects = asyncHandler(async (req: Request, res: Response) => {
    const teamId = new Types.ObjectId(req.params.teamId);
    const userId = req.user._id;

    const projects = await projectService.getTeamProjects(teamId, userId);

    return response.success(res, 'Projects retrieved successfully', projects);
  });

  /**
   * Get all projects user has access to
   * GET /api/projects
   */
  getUserProjects = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;

    const projects = await projectService.getUserProjects(userId);

    return response.success(res, 'Projects retrieved successfully', projects);
  });

  /**
   * Get project by ID
   * GET /api/projects/:id
   */
  getProjectById = asyncHandler(async (req: Request, res: Response) => {
    const projectId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;

    const project = await projectService.getProjectById(projectId, userId);

    return response.success(res, 'Project retrieved successfully', project);
  });

  /**
   * Update project
   * PUT /api/projects/:id
   */
  updateProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;
    const updates = {
      ...req.body,
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    };

    const project = await projectService.updateProject(projectId, userId, updates);

    return response.success(res, 'Project updated successfully', project);
  });

  /**
   * Delete project
   * DELETE /api/projects/:id
   */
  deleteProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;

    const result = await projectService.deleteProject(projectId, userId);

    return response.success(res, result.message);
  });

  /**
   * Get project statistics
   * GET /api/projects/:id/stats
   */
  getProjectStats = asyncHandler(async (req: Request, res: Response) => {
    const projectId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;

    const stats = await projectService.getProjectStats(projectId, userId);

    return response.success(res, 'Project statistics retrieved successfully', stats);
  });
}

export default new ProjectController(); 
import { Request, Response } from 'express';
import { taskService } from '../services';
import { asyncHandler, response } from '../utils';
import { Types } from 'mongoose';
import { TaskStatus, TaskPriority } from '../types/enums';

class TaskController {
  /**
   * Create a new task
   * POST /api/tasks
   */
  createTask = asyncHandler(async (req: Request, res: Response) => {
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      dueDate,
      tags,
    } = req.body;
    const userId = req.user._id;

    const task = await taskService.createTask(
      title,
      new Types.ObjectId(project),
      userId,
      description,
      assignedTo ? new Types.ObjectId(assignedTo) : undefined,
      status,
      priority,
      dueDate ? new Date(dueDate) : undefined,
      tags
    );

    return response.created(res, 'Task created successfully', task);
  });

  /**
   * Get all tasks for a project
   * GET /api/projects/:projectId/tasks
   */
  getProjectTasks = asyncHandler(async (req: Request, res: Response) => {
    const projectId = new Types.ObjectId(req.params.projectId);
    const userId = req.user._id;
    
    const filters: {
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: Types.ObjectId;
    } = {};

    if (req.query.status) filters.status = req.query.status as TaskStatus;
    if (req.query.priority) filters.priority = req.query.priority as TaskPriority;
    if (req.query.assignedTo) filters.assignedTo = new Types.ObjectId(req.query.assignedTo as string);

    const tasks = await taskService.getProjectTasks(projectId, userId, filters);

    return response.success(res, 'Tasks retrieved successfully', tasks);
  });

  /**
   * Get tasks assigned to current user
   * GET /api/tasks/my-tasks
   */
  getUserTasks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;

    const tasks = await taskService.getUserTasks(userId);

    return response.success(res, 'Your tasks retrieved successfully', tasks);
  });

  /**
   * Get task by ID
   * GET /api/tasks/:id
   */
  getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const taskId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;

    const task = await taskService.getTaskById(taskId, userId);

    return response.success(res, 'Task retrieved successfully', task);
  });

  /**
   * Update task
   * PUT /api/tasks/:id
   */
  updateTask = asyncHandler(async (req: Request, res: Response) => {
    const taskId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;
    const updates = {
      ...req.body,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
    };

    const task = await taskService.updateTask(taskId, userId, updates);

    return response.success(res, 'Task updated successfully', task);
  });

  /**
   * Update task status
   * PATCH /api/tasks/:id/status
   */
  updateTaskStatus = asyncHandler(async (req: Request, res: Response) => {
    const taskId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;
    const { status } = req.body;

    const task = await taskService.updateTaskStatus(taskId, userId, status);

    return response.success(res, 'Task status updated successfully', task);
  });

  /**
   * Assign task to user
   * PATCH /api/tasks/:id/assign
   */
  assignTask = asyncHandler(async (req: Request, res: Response) => {
    const taskId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;
    const { userId: assigneeId } = req.body;

    const task = await taskService.assignTask(
      taskId,
      userId,
      new Types.ObjectId(assigneeId)
    );

    return response.success(res, 'Task assigned successfully', task);
  });

  /**
   * Unassign task
   * PATCH /api/tasks/:id/unassign
   */
  unassignTask = asyncHandler(async (req: Request, res: Response) => {
    const taskId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;

    const task = await taskService.unassignTask(taskId, userId);

    return response.success(res, 'Task unassigned successfully', task);
  });

  /**
   * Delete task
   * DELETE /api/tasks/:id
   */
  deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const taskId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;

    const result = await taskService.deleteTask(taskId, userId);

    return response.success(res, result.message);
  });
}

export default new TaskController(); 
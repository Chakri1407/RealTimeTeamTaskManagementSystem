import { Types } from 'mongoose';
import { Task, Project, Team, User, ActivityLog } from '../models';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { TaskStatus, TaskPriority, ActivityAction } from '../types/enums';
import { socketEmitter } from '../utils/socketEmitter';

class TaskService {
  /**
   * Create a new task
   */
  async createTask(
    title: string,
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
    description?: string,
    assignedTo?: Types.ObjectId,
    status?: TaskStatus,
    priority?: TaskPriority,
    dueDate?: Date,
    tags?: string[]
  ) {
    // Verify project exists and user is team member
    const project = await Project.findById(projectId).populate('team');
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const team = await Team.findById(project.team);
    if (!team || !team.isMember(userId)) {
      throw new ForbiddenError('You must be a team member to create tasks');
    }

    // If assigning to someone, verify they're a team member
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        throw new NotFoundError('Assignee not found');
      }

      if (!team.isMember(assignedTo)) {
        throw new BadRequestError('Can only assign tasks to team members');
      }
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      createdBy: userId,
      status: status || TaskStatus.TODO,
      priority: priority || TaskPriority.MEDIUM,
      dueDate,
      tags: tags || [],
    });

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.TASK_CREATED,
      user: userId,
      team: project.team as Types.ObjectId,
      project: projectId,
      task: task._id,
      description: `Task "${title}" created`,
    });

    // Emit real-time event
    const creator = await User.findById(userId);
    const assigneeUser = assignedTo ? await User.findById(assignedTo) : null;
    socketEmitter.emitTaskCreated({
      taskId: task._id.toString(),
      taskTitle: task.title,
      projectId: projectId.toString(),
      teamId: (project.team as Types.ObjectId).toString(),
      userId: userId.toString(),
      userName: creator?.name || 'Unknown',
      assigneeId: assignedTo?.toString(),
      assigneeName: assigneeUser?.name,
      status: task.status,
      priority: task.priority,
      timestamp: new Date(),
    });

    return task;
  }

  /**
   * Get all tasks for a project
   */
  async getProjectTasks(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
    filters?: {
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: Types.ObjectId;
    }
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

    // Build query
    const query: any = { project: projectId };
    if (filters?.status) query.status = filters.status;
    if (filters?.priority) query.priority = filters.priority;
    if (filters?.assignedTo) query.assignedTo = filters.assignedTo;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return tasks;
  }

  /**
   * Get tasks assigned to user
   */
  async getUserTasks(userId: Types.ObjectId) {
    const tasks = await Task.find({ assignedTo: userId })
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    return tasks;
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: Types.ObjectId, userId: Types.ObjectId) {
    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name team');

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Verify user has access through team membership
    const project = await Project.findById(task.project);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const team = await Team.findById(project.team);
    if (!team || !team.isMember(userId)) {
      throw new ForbiddenError('You do not have access to this task');
    }

    return task;
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: Types.ObjectId,
    userId: Types.ObjectId,
    updates: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: Date;
      tags?: string[];
    }
  ) {
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

    // Update fields
    if (updates.title) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.priority) task.priority = updates.priority;
    if (updates.dueDate) task.dueDate = updates.dueDate;
    if (updates.tags) task.tags = updates.tags;

    // Handle status change separately for validation
    if (updates.status && updates.status !== task.status) {
      if (!task.canTransitionTo(updates.status)) {
        throw new BadRequestError(
          `Cannot transition from ${task.status} to ${updates.status}`
        );
      }
      task.status = updates.status;

      // Log status change
      await ActivityLog.createLog({
        action: ActivityAction.TASK_STATUS_CHANGED,
        user: userId,
        team: project.team,
        project: project._id,
        task: task._id,
        description: `Task "${task.title}" status changed to ${updates.status}`,
        metadata: { oldStatus: task.status, newStatus: updates.status },
      });
    }

    await task.save();

    // Log general update
    await ActivityLog.createLog({
      action: ActivityAction.TASK_UPDATED,
      user: userId,
      team: project.team,
      project: project._id,
      task: task._id,
      description: `Task "${task.title}" updated`,
    });

    // Emit real-time event
    const updater = await User.findById(userId);
    socketEmitter.emitTaskUpdated({
      taskId: task._id.toString(),
      taskTitle: task.title,
      projectId: project._id.toString(),
      teamId: project.team.toString(),
      userId: userId.toString(),
      userName: updater?.name || 'Unknown',
      assigneeId: task.assignedTo?.toString(),
      status: task.status,
      priority: task.priority,
      timestamp: new Date(),
    });

    return task;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    taskId: Types.ObjectId,
    userId: Types.ObjectId,
    newStatus: TaskStatus
  ) {
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

    // Validate status transition
    if (!task.canTransitionTo(newStatus)) {
      throw new BadRequestError(
        `Cannot transition from ${task.status} to ${newStatus}`
      );
    }

    const oldStatus = task.status;
    task.status = newStatus;
    await task.save();

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.TASK_STATUS_CHANGED,
      user: userId,
      team: project.team,
      project: project._id,
      task: task._id,
      description: `Task "${task.title}" status changed from ${oldStatus} to ${newStatus}`,
      metadata: { oldStatus, newStatus },
    });

    // Emit real-time event
    const updater = await User.findById(userId);
    socketEmitter.emitTaskStatusChanged({
      taskId: task._id.toString(),
      taskTitle: task.title,
      projectId: project._id.toString(),
      teamId: project.team.toString(),
      userId: userId.toString(),
      userName: updater?.name || 'Unknown',
      assigneeId: task.assignedTo?.toString(),
      status: newStatus,
      previousStatus: oldStatus,
      timestamp: new Date(),
    });

    return task;
  }

  /**
   * Assign task to user
   */
  async assignTask(
    taskId: Types.ObjectId,
    userId: Types.ObjectId,
    assigneeId: Types.ObjectId
  ) {
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Verify requester has access
    const project = await Project.findById(task.project);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const team = await Team.findById(project.team);
    if (!team || !team.isMember(userId)) {
      throw new ForbiddenError('You do not have access to this task');
    }

    // Verify assignee is team member
    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      throw new NotFoundError('Assignee not found');
    }

    if (!team.isMember(assigneeId)) {
      throw new BadRequestError('Can only assign tasks to team members');
    }

    const previousAssignee = task.assignedTo;
    task.assignedTo = assigneeId;
    await task.save();

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.TASK_ASSIGNED,
      user: userId,
      team: project.team,
      project: project._id,
      task: task._id,
      description: `Task "${task.title}" assigned to ${assignee.name}`,
      metadata: {
        assigneeId: assigneeId.toString(),
        previousAssignee: previousAssignee?.toString(),
      },
    });

    // Emit real-time event
    const assigner = await User.findById(userId);
    socketEmitter.emitTaskAssigned({
      taskId: task._id.toString(),
      taskTitle: task.title,
      projectId: project._id.toString(),
      teamId: project.team.toString(),
      userId: userId.toString(),
      userName: assigner?.name || 'Unknown',
      assigneeId: assigneeId.toString(),
      assigneeName: assignee.name,
      timestamp: new Date(),
    });

    return task;
  }

  /**
   * Unassign task
   */
  async unassignTask(taskId: Types.ObjectId, userId: Types.ObjectId) {
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

    if (!task.assignedTo) {
      throw new BadRequestError('Task is not assigned to anyone');
    }

    const previousAssignee = task.assignedTo;
    task.assignedTo = undefined;
    await task.save();

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.TASK_UNASSIGNED,
      user: userId,
      team: project.team,
      project: project._id,
      task: task._id,
      description: `Task "${task.title}" unassigned`,
      metadata: { previousAssignee: previousAssignee.toString() },
    });

    // Emit real-time event
    const unassigner = await User.findById(userId);
    socketEmitter.emitTaskUnassigned({
      taskId: task._id.toString(),
      taskTitle: task.title,
      projectId: project._id.toString(),
      teamId: project.team.toString(),
      userId: userId.toString(),
      userName: unassigner?.name || 'Unknown',
      previousAssigneeId: previousAssignee.toString(),
      timestamp: new Date(),
    });

    return task;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: Types.ObjectId, userId: Types.ObjectId) {
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
    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Only team admins or task creator can delete
    const isAdmin = team.isAdmin(userId);
    const isCreator = task.createdBy.toString() === userId.toString();

    if (!isAdmin && !isCreator) {
      throw new ForbiddenError('Only team admins or task creator can delete tasks');
    }

    // Log activity before deletion
    await ActivityLog.createLog({
      action: ActivityAction.TASK_DELETED,
      user: userId,
      team: project.team,
      project: project._id,
      task: task._id,
      description: `Task "${task.title}" deleted`,
    });

    // Emit real-time event before deletion
    const deleter = await User.findById(userId);
    socketEmitter.emitTaskDeleted({
      taskId: task._id.toString(),
      taskTitle: task.title,
      projectId: project._id.toString(),
      teamId: project.team.toString(),
      userId: userId.toString(),
      userName: deleter?.name || 'Unknown',
      timestamp: new Date(),
    });

    await task.deleteOne();

    return { message: 'Task deleted successfully' };
  }
}

export default new TaskService(); 
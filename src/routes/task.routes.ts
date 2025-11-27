import { Router } from 'express';
import { taskController } from '../controllers';
import { authenticate } from '../middlewares';
import { validateRequest } from '../middlewares/validate';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  AssignTaskDto,
} from '../validators/task.validator';
import { MongoIdDto } from '../validators/common.validator';

const router = Router();

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateRequest(CreateTaskDto),
  taskController.createTask
);

/**
 * @route   GET /api/tasks/my-tasks
 * @desc    Get tasks assigned to current user
 * @access  Private
 * @note    This route must be before /:id to avoid matching "my-tasks" as an ID
 */
router.get(
  '/my-tasks',
  authenticate,
  taskController.getUserTasks
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  taskController.getTaskById
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  validateRequest(UpdateTaskDto),
  taskController.updateTask
);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update task status
 * @access  Private
 */
router.patch(
  '/:id/status',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  validateRequest(UpdateTaskStatusDto),
  taskController.updateTaskStatus
);

/**
 * @route   PATCH /api/tasks/:id/assign
 * @desc    Assign task to user
 * @access  Private
 */
router.patch(
  '/:id/assign',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  validateRequest(AssignTaskDto),
  taskController.assignTask
);

/**
 * @route   PATCH /api/tasks/:id/unassign
 * @desc    Unassign task
 * @access  Private
 */
router.patch(
  '/:id/unassign',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  taskController.unassignTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  taskController.deleteTask
);

export default router; 
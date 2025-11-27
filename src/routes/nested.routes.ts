import { Router } from 'express';
import { projectController, taskController } from '../controllers';
import { authenticate, isTeamMember, isProjectMember } from '../middlewares';
import { validateRequest } from '../middlewares/validate';
import { MongoIdDto } from '../validators/common.validator';

const router = Router();

/**
 * Nested Routes for Teams
 */

/**
 * @route   GET /api/teams/:teamId/projects
 * @desc    Get all projects for a team
 * @access  Private (Team Member)
 */
router.get(
  '/teams/:teamId/projects',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  isTeamMember,
  projectController.getTeamProjects
);

/**
 * Nested Routes for Projects
 */

/**
 * @route   GET /api/projects/:projectId/tasks
 * @desc    Get all tasks for a project
 * @access  Private (Project Member)
 */
router.get(
  '/projects/:projectId/tasks',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  isProjectMember,
  taskController.getProjectTasks
);

export default router; 
import { Router } from 'express';
import { activityController } from '../controllers';
import { authenticate, isTeamMember, isProjectMember } from '../middlewares';
import { validateRequest } from '../middlewares/validate';
import { TeamIdDto, ProjectIdDto, TaskIdDto } from '../validators/common.validator';

const router = Router();

/**
 * @route   GET /api/activity/me
 * @desc    Get current user's activity logs
 * @access  Private
 * @note    This route must be before others to avoid matching "me" as an ID
 */
router.get(
  '/me',
  authenticate,
  activityController.getUserActivity
);

/**
 * @route   GET /api/activity/range
 * @desc    Get activity by date range
 * @access  Private
 */
router.get(
  '/range',
  authenticate,
  activityController.getActivityByDateRange
);

/**
 * @route   GET /api/activity/teams/:teamId
 * @desc    Get team activity logs
 * @access  Private (Team Member)
 */
router.get(
  '/teams/:teamId',
  authenticate,
  validateRequest(TeamIdDto, 'params'),
  isTeamMember,
  activityController.getTeamActivity
);

/**
 * @route   GET /api/activity/projects/:projectId
 * @desc    Get project activity logs
 * @access  Private (Project Member)
 */
router.get(
  '/projects/:projectId',
  authenticate,
  validateRequest(ProjectIdDto, 'params'),
  isProjectMember,
  activityController.getProjectActivity
);

/**
 * @route   GET /api/activity/tasks/:taskId
 * @desc    Get task activity history
 * @access  Private
 */
router.get(
  '/tasks/:taskId',
  authenticate,
  validateRequest(TaskIdDto, 'params'),
  activityController.getTaskHistory
);

export default router; 
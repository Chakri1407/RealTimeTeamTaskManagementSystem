import { Router } from 'express';
import { projectController } from '../controllers';
import { authenticate, isProjectMember } from '../middlewares';
import { validateRequest } from '../middlewares/validate';
import {
  CreateProjectDto,
  UpdateProjectDto,
} from '../validators/project.validator';
import { MongoIdDto } from '../validators/common.validator';

const router = Router();

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateRequest(CreateProjectDto),
  projectController.createProject
);

/**
 * @route   GET /api/projects
 * @desc    Get all projects user has access to
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  projectController.getUserProjects
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private (Project Member)
 */
router.get(
  '/:id',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  isProjectMember,
  projectController.getProjectById
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private (Project Member)
 */
router.put(
  '/:id',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  validateRequest(UpdateProjectDto),
  isProjectMember,
  projectController.updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private (Team Admin or Project Creator)
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  isProjectMember,
  projectController.deleteProject
);

/**
 * @route   GET /api/projects/:id/stats
 * @desc    Get project statistics
 * @access  Private (Project Member)
 */
router.get(
  '/:id/stats',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  isProjectMember,
  projectController.getProjectStats
);

export default router; 
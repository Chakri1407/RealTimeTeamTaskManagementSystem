import { Router } from 'express';
import { teamController } from '../controllers';
import { authenticate, isTeamMember, isTeamAdmin } from '../middlewares';
import { validateRequest } from '../middlewares/validate';
import {
  CreateTeamDto,
  UpdateTeamDto,
  AddTeamMemberDto,
  UpdateMemberRoleDto,
} from '../validators/team.validator';
import { MongoIdDto } from '../validators/common.validator';

const router = Router();

/**
 * @route   POST /api/teams
 * @desc    Create a new team
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateRequest(CreateTeamDto),
  teamController.createTeam
);

/**
 * @route   GET /api/teams
 * @desc    Get all teams for current user
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  teamController.getUserTeams
);

/**
 * @route   GET /api/teams/:id
 * @desc    Get team by ID
 * @access  Private (Team Member)
 */
router.get(
  '/:id',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  isTeamMember,
  teamController.getTeamById
);

/**
 * @route   PUT /api/teams/:id
 * @desc    Update team
 * @access  Private (Team Admin)
 */
router.put(
  '/:id',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  validateRequest(UpdateTeamDto),
  isTeamAdmin,
  teamController.updateTeam
);

/**
 * @route   DELETE /api/teams/:id
 * @desc    Delete team
 * @access  Private (Team Creator)
 */
router.delete(
  '/:id',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  isTeamAdmin,
  teamController.deleteTeam
);

/**
 * @route   POST /api/teams/:id/members
 * @desc    Add member to team
 * @access  Private (Team Admin)
 */
router.post(
  '/:id/members',
  authenticate,
  validateRequest(MongoIdDto, 'params'),
  validateRequest(AddTeamMemberDto),
  isTeamAdmin,
  teamController.addMember
);

/**
 * @route   DELETE /api/teams/:id/members/:memberId
 * @desc    Remove member from team
 * @access  Private (Team Admin)
 */
router.delete(
  '/:id/members/:memberId',
  authenticate,
  isTeamAdmin,
  teamController.removeMember
);

/**
 * @route   PATCH /api/teams/:id/members/:memberId/role
 * @desc    Update member role
 * @access  Private (Team Admin)
 */
router.patch(
  '/:id/members/:memberId/role',
  authenticate,
  validateRequest(UpdateMemberRoleDto),
  isTeamAdmin,
  teamController.updateMemberRole
);

export default router; 
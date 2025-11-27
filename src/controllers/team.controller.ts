import { Request, Response } from 'express';
import { teamService } from '../services';
import { asyncHandler, response } from '../utils';
import { Types } from 'mongoose';

class TeamController {
  /**
   * Create a new team
   * POST /api/teams
   */
  createTeam = asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const userId = req.user._id;

    const team = await teamService.createTeam(name, description, userId);

    return response.created(res, 'Team created successfully', team);
  });

  /**
   * Get all teams for current user
   * GET /api/teams
   */
  getUserTeams = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;

    const teams = await teamService.getUserTeams(userId);

    return response.success(res, 'Teams retrieved successfully', teams);
  });

  /**
   * Get team by ID
   * GET /api/teams/:id
   */
  getTeamById = asyncHandler(async (req: Request, res: Response) => {
    const teamId = new Types.ObjectId(req.params.id);

    const team = await teamService.getTeamById(teamId);

    return response.success(res, 'Team retrieved successfully', team);
  });

  /**
   * Update team
   * PUT /api/teams/:id
   */
  updateTeam = asyncHandler(async (req: Request, res: Response) => {
    const teamId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;
    const updates = req.body;

    const team = await teamService.updateTeam(teamId, userId, updates);

    return response.success(res, 'Team updated successfully', team);
  });

  /**
   * Delete team
   * DELETE /api/teams/:id
   */
  deleteTeam = asyncHandler(async (req: Request, res: Response) => {
    const teamId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;

    const result = await teamService.deleteTeam(teamId, userId);

    return response.success(res, result.message);
  });

  /**
   * Add member to team
   * POST /api/teams/:id/members
   */
  addMember = asyncHandler(async (req: Request, res: Response) => {
    const teamId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;
    const { userId: newMemberId, role } = req.body;

    const team = await teamService.addMember(
      teamId,
      userId,
      new Types.ObjectId(newMemberId),
      role
    );

    return response.success(res, 'Member added successfully', team);
  });

  /**
   * Remove member from team
   * DELETE /api/teams/:id/members/:memberId
   */
  removeMember = asyncHandler(async (req: Request, res: Response) => {
    const teamId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;
    const memberIdToRemove = new Types.ObjectId(req.params.memberId);

    const team = await teamService.removeMember(teamId, userId, memberIdToRemove);

    return response.success(res, 'Member removed successfully', team);
  });

  /**
   * Update member role
   * PATCH /api/teams/:id/members/:memberId/role
   */
  updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
    const teamId = new Types.ObjectId(req.params.id);
    const userId = req.user._id;
    const memberId = new Types.ObjectId(req.params.memberId);
    const { role } = req.body;

    const team = await teamService.updateMemberRole(teamId, userId, memberId, role);

    return response.success(res, 'Member role updated successfully', team);
  });
}

export default new TeamController(); 
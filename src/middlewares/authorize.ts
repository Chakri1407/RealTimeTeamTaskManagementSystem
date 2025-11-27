import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { Team, Project } from '../models';
import { UserRole } from '../types/enums';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Check if user has specific role
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

/**
 * Check if user is a team member
 */
export const isTeamMember = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const teamId = req.params.teamId || req.params.id || req.body.team;

    if (!teamId) {
      throw new ForbiddenError('Team ID required');
    }

    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    const isMember = team.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      throw new ForbiddenError('You are not a member of this team');
    }

    // Attach team to request for later use
    (req as any).team = team;

    next();
  }
);

/**
 * Check if user is a team admin
 */
export const isTeamAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const teamId = req.params.teamId || req.params.id || req.body.team;

    if (!teamId) {
      throw new ForbiddenError('Team ID required');
    }

    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    const memberEntry = team.members.find(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!memberEntry) {
      throw new ForbiddenError('You are not a member of this team');
    }

    if (memberEntry.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Admin privileges required');
    }

    // Attach team to request
    (req as any).team = team;

    next();
  }
);

/**
 * Check if user is project member (via team membership)
 */
export const isProjectMember = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const projectId = req.params.projectId || req.params.id;

    if (!projectId) {
      throw new ForbiddenError('Project ID required');
    }

    const project = await Project.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Fetch the team separately to get full document with members
    const team = await Team.findById(project.team);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    const isMember = team.members.some(
      (member) => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      throw new ForbiddenError('You are not a member of this project\'s team');
    }

    // Attach project to request
    (req as any).project = project;

    next();
  }
);

/**
 * Check if user owns the resource
 */
export const isOwner = (resourceUserField: string = 'createdBy') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const resource = (req as any)[resourceUserField];
    const resourceOwnerId = resource?.createdBy || resource?.user;

    if (!resourceOwnerId) {
      return next();
    }

    if (resourceOwnerId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('You do not own this resource');
    }

    next();
  };
}; 
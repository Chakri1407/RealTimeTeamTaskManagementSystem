import { Types } from 'mongoose';
import { Team, User, ActivityLog } from '../models';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../utils/errors';
import { UserRole, ActivityAction } from '../types/enums';
import { socketEmitter } from '../utils/socketEmitter';

class TeamService {
  /**
   * Create a new team
   */
  async createTeam(name: string, description: string | undefined, createdBy: Types.ObjectId) {
    // Create team with creator as admin
    const team = await Team.create({
      name,
      description,
      createdBy,
      members: [
        {
          user: createdBy,
          role: UserRole.ADMIN,
          joinedAt: new Date(),
        },
      ],
    });

    // Add team to user's teams array
    await User.findByIdAndUpdate(createdBy, {
      $push: { teams: team._id },
    });

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.TEAM_CREATED,
      user: createdBy,
      team: team._id,
      description: `Team "${name}" created`,
    });

    // Emit real-time event
    socketEmitter.emitTeamCreated({
      teamId: team._id.toString(),
      teamName: team.name,
      userId: createdBy.toString(),
      timestamp: new Date(),
    });

    return team;
  }

  /**
   * Get all teams for a user
   */
  async getUserTeams(userId: Types.ObjectId) {
    const teams = await Team.find({ 'members.user': userId })
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    return teams;
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: Types.ObjectId) {
    const team = await Team.findById(teamId)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    return team;
  }

  /**
   * Update team
   */
  async updateTeam(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
    updates: { name?: string; description?: string }
  ) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if user is team admin
    if (!team.isAdmin(userId)) {
      throw new ForbiddenError('Only team admins can update team details');
    }

    // Update fields
    if (updates.name) team.name = updates.name;
    if (updates.description !== undefined) team.description = updates.description;

    await team.save();

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.TEAM_UPDATED,
      user: userId,
      team: team._id,
      description: `Team "${team.name}" updated`,
    });

    // Emit real-time event
    socketEmitter.emitTeamUpdated({
      teamId: team._id.toString(),
      teamName: team.name,
      userId: userId.toString(),
      timestamp: new Date(),
    });

    return team;
  }

  /**
   * Delete team
   */
  async deleteTeam(teamId: Types.ObjectId, userId: Types.ObjectId) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Only team creator can delete
    if (team.createdBy.toString() !== userId.toString()) {
      throw new ForbiddenError('Only team creator can delete the team');
    }

    // Remove team from all members' teams array
    await User.updateMany(
      { _id: { $in: team.members.map((m) => m.user) } },
      { $pull: { teams: team._id } }
    );

    // Log activity before deletion
    await ActivityLog.createLog({
      action: ActivityAction.TEAM_DELETED,
      user: userId,
      team: team._id,
      description: `Team "${team.name}" deleted`,
    });

    // Emit real-time event before deletion
    socketEmitter.emitTeamDeleted({
      teamId: team._id.toString(),
      teamName: team.name,
      userId: userId.toString(),
      timestamp: new Date(),
    });

    await team.deleteOne();

    return { message: 'Team deleted successfully' };
  }

  /**
   * Add member to team
   */
  async addMember(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
    newMemberId: Types.ObjectId,
    role: UserRole = UserRole.MEMBER
  ) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if requester is admin
    if (!team.isAdmin(userId)) {
      throw new ForbiddenError('Only team admins can add members');
    }

    // Check if user exists
    const newMember = await User.findById(newMemberId);
    if (!newMember) {
      throw new NotFoundError('User not found');
    }

    // Check if already a member
    if (team.isMember(newMemberId)) {
      throw new ConflictError('User is already a team member');
    }

    // Add member
    team.members.push({
      user: newMemberId,
      role,
      joinedAt: new Date(),
    });

    await team.save();

    // Add team to user's teams array
    await User.findByIdAndUpdate(newMemberId, {
      $push: { teams: team._id },
    });

    // Log activity
    await ActivityLog.createLog({
      action: ActivityAction.MEMBER_ADDED,
      user: userId,
      team: team._id,
      description: `${newMember.name} added to team "${team.name}"`,
      metadata: { newMemberId: newMemberId.toString(), role },
    });

    // Emit real-time event
    socketEmitter.emitMemberAdded(team._id.toString(), {
      teamId: team._id.toString(),
      teamName: team.name,
      userId: newMemberId.toString(),
      userName: newMember.name,
      role,
      timestamp: new Date(),
    });

    return team;
  }

  /**
   * Remove member from team
   */
  async removeMember(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
    memberIdToRemove: Types.ObjectId
  ) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if requester is admin
    if (!team.isAdmin(userId)) {
      throw new ForbiddenError('Only team admins can remove members');
    }

    // Can't remove team creator
    if (team.createdBy.toString() === memberIdToRemove.toString()) {
      throw new ForbiddenError('Cannot remove team creator');
    }

    // Check if member exists in team
    if (!team.isMember(memberIdToRemove)) {
      throw new BadRequestError('User is not a team member');
    }

    // Ensure at least one admin remains
    const adminCount = team.members.filter((m) => m.role === UserRole.ADMIN).length;
    const isRemovingAdmin = team.members.find(
      (m) => m.user.toString() === memberIdToRemove.toString() && m.role === UserRole.ADMIN
    );

    if (adminCount <= 1 && isRemovingAdmin) {
      throw new BadRequestError('Cannot remove the last admin. Assign another admin first.');
    }

    // Remove member
    team.members = team.members.filter(
      (m) => m.user.toString() !== memberIdToRemove.toString()
    );

    await team.save();

    // Remove team from user's teams array
    await User.findByIdAndUpdate(memberIdToRemove, {
      $pull: { teams: team._id },
    });

    // Log activity
    const removedUser = await User.findById(memberIdToRemove);
    await ActivityLog.createLog({
      action: ActivityAction.MEMBER_REMOVED,
      user: userId,
      team: team._id,
      description: `${removedUser?.name} removed from team "${team.name}"`,
      metadata: { removedMemberId: memberIdToRemove.toString() },
    });

    // Emit real-time event
    socketEmitter.emitMemberRemoved(team._id.toString(), memberIdToRemove.toString(), {
      teamId: team._id.toString(),
      teamName: team.name,
      userId: memberIdToRemove.toString(),
      userName: removedUser?.name,
      timestamp: new Date(),
    });

    return team;
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
    memberId: Types.ObjectId,
    newRole: UserRole
  ) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('Team not found');
    }

    // Check if requester is admin
    if (!team.isAdmin(userId)) {
      throw new ForbiddenError('Only team admins can update member roles');
    }

    // Can't change creator's role
    if (team.createdBy.toString() === memberId.toString()) {
      throw new ForbiddenError('Cannot change team creator role');
    }

    // Find member
    const member = team.members.find((m) => m.user.toString() === memberId.toString());

    if (!member) {
      throw new BadRequestError('User is not a team member');
    }

    // Ensure at least one admin remains if demoting an admin
    if (member.role === UserRole.ADMIN && newRole === UserRole.MEMBER) {
      const adminCount = team.members.filter((m) => m.role === UserRole.ADMIN).length;
      if (adminCount <= 1) {
        throw new BadRequestError('Cannot demote the last admin');
      }
    }

    // Update role
    member.role = newRole;
    await team.save();

    // Log activity
    const updatedUser = await User.findById(memberId);
    await ActivityLog.createLog({
      action: ActivityAction.MEMBER_ROLE_CHANGED,
      user: userId,
      team: team._id,
      description: `${updatedUser?.name} role changed to ${newRole} in team "${team.name}"`,
      metadata: { memberId: memberId.toString(), newRole },
    });

    // Emit real-time event
    socketEmitter.emitMemberRoleChanged(team._id.toString(), {
      teamId: team._id.toString(),
      teamName: team.name,
      userId: memberId.toString(),
      userName: updatedUser?.name,
      role: newRole,
      timestamp: new Date(),
    });

    return team;
  }
}

export default new TeamService(); 
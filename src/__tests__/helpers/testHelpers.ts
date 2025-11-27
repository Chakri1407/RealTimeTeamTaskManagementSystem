import { User, Team, Project, Task } from '../../models';
import { UserRole, TaskStatus, TaskPriority } from '../../types/enums';
import jwtUtil from '../../utils/jwt';
import { Types } from 'mongoose';

/**
 * Create a test user
 */
export const createTestUser = async (overrides: Partial<{
  name: string;
  email: string;
  password: string;
  role: UserRole;
}> = {}) => {
  const user = await User.create({
    name: overrides.name || 'Test User',
    email: overrides.email || `test${Date.now()}@example.com`,
    password: overrides.password || 'password123',
    role: overrides.role || UserRole.MEMBER,
  });
  return user;
};

/**
 * Create test user with auth token
 */
export const createTestUserWithToken = async (overrides: Partial<{
  name: string;
  email: string;
  password: string;
  role: UserRole;
}> = {}) => {
  const user = await createTestUser(overrides);
  const tokens = jwtUtil.generateTokenPair(user._id, user.email, user.role);
  return { user, tokens };
};

/**
 * Create a test team
 */
export const createTestTeam = async (
  creatorId: Types.ObjectId,
  overrides: Partial<{
    name: string;
    description: string;
  }> = {}
) => {
  const team = await Team.create({
    name: overrides.name || 'Test Team',
    description: overrides.description || 'Test team description',
    createdBy: creatorId,
    members: [
      {
        user: creatorId,
        role: UserRole.ADMIN,
        joinedAt: new Date(),
      },
    ],
  });

  // Add team to user
  await User.findByIdAndUpdate(creatorId, {
    $push: { teams: team._id },
  });

  return team;
};

/**
 * Create a test project
 */
export const createTestProject = async (
  teamId: Types.ObjectId,
  creatorId: Types.ObjectId,
  overrides: Partial<{
    name: string;
    description: string;
    status: string;
  }> = {}
) => {
  const project = await Project.create({
    name: overrides.name || 'Test Project',
    description: overrides.description || 'Test project description',
    team: teamId,
    createdBy: creatorId,
    status: overrides.status || 'Active',
  });
  return project;
};

/**
 * Create a test task
 */
export const createTestTask = async (
  projectId: Types.ObjectId,
  creatorId: Types.ObjectId,
  overrides: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: Types.ObjectId;
  }> = {}
) => {
  const task = await Task.create({
    title: overrides.title || 'Test Task',
    description: overrides.description || 'Test task description',
    project: projectId,
    createdBy: creatorId,
    status: overrides.status || TaskStatus.TODO,
    priority: overrides.priority || TaskPriority.MEDIUM,
    assignedTo: overrides.assignedTo,
  });
  return task;
};

/**
 * Generate auth header
 */
export const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});


import request from 'supertest';
import createApp from '../app';
import { UserRole } from '../types/enums';
import {
  createTestUserWithToken,
  createTestTeam,
  getAuthHeader,
} from './helpers/testHelpers';

const app = createApp();

describe('Team API', () => {
  describe('POST /api/teams', () => {
    it('should create a new team', async () => {
      const { tokens } = await createTestUserWithToken();

      const res = await request(app)
        .post('/api/teams')
        .set(getAuthHeader(tokens.accessToken))
        .send({
          name: 'New Team',
          description: 'Team description',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Team');
      expect(res.body.data.members).toHaveLength(1);
      expect(res.body.data.members[0].role).toBe(UserRole.ADMIN);
    });

    it('should fail without auth token', async () => {
      const res = await request(app)
        .post('/api/teams')
        .send({ name: 'Team' });

      expect(res.status).toBe(401);
    });

    it('should fail with short team name', async () => {
      const { tokens } = await createTestUserWithToken();

      const res = await request(app)
        .post('/api/teams')
        .set(getAuthHeader(tokens.accessToken))
        .send({ name: 'A' });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/teams', () => {
    it('should return all teams for user', async () => {
      const { user, tokens } = await createTestUserWithToken();
      await createTestTeam(user._id, { name: 'Team 1' });
      await createTestTeam(user._id, { name: 'Team 2' });

      const res = await request(app)
        .get('/api/teams')
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should return empty array for user with no teams', async () => {
      const { tokens } = await createTestUserWithToken();

      const res = await request(app)
        .get('/api/teams')
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/teams/:id', () => {
    it('should return team by ID', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id, { name: 'Test Team' });

      const res = await request(app)
        .get(`/api/teams/${team._id}`)
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test Team');
    });

    it('should fail for non-member', async () => {
      const { user } = await createTestUserWithToken();
      const { tokens: otherTokens } = await createTestUserWithToken({
        email: 'other@example.com',
      });
      const team = await createTestTeam(user._id);

      const res = await request(app)
        .get(`/api/teams/${team._id}`)
        .set(getAuthHeader(otherTokens.accessToken));

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/teams/:id', () => {
    it('should update team as admin', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);

      const res = await request(app)
        .put(`/api/teams/${team._id}`)
        .set(getAuthHeader(tokens.accessToken))
        .send({ name: 'Updated Team Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Team Name');
    });
  });

  describe('POST /api/teams/:id/members', () => {
    it('should add member to team', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const { user: newMember } = await createTestUserWithToken({
        email: 'newmember@example.com',
      });
      const team = await createTestTeam(user._id);

      const res = await request(app)
        .post(`/api/teams/${team._id}/members`)
        .set(getAuthHeader(tokens.accessToken))
        .send({
          userId: newMember._id.toString(),
          role: UserRole.MEMBER,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.members).toHaveLength(2);
    });

    it('should fail to add existing member', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);

      const res = await request(app)
        .post(`/api/teams/${team._id}/members`)
        .set(getAuthHeader(tokens.accessToken))
        .send({
          userId: user._id.toString(),
          role: UserRole.MEMBER,
        });

      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/teams/:id/members/:memberId', () => {
    it('should remove member from team', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const { user: memberToRemove } = await createTestUserWithToken({
        email: 'toremove@example.com',
      });
      const team = await createTestTeam(user._id);

      // Add member first
      await request(app)
        .post(`/api/teams/${team._id}/members`)
        .set(getAuthHeader(tokens.accessToken))
        .send({ userId: memberToRemove._id.toString() });

      // Remove member
      const res = await request(app)
        .delete(`/api/teams/${team._id}/members/${memberToRemove._id}`)
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.members).toHaveLength(1);
    });
  });

  describe('DELETE /api/teams/:id', () => {
    it('should delete team as creator', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);

      const res = await request(app)
        .delete(`/api/teams/${team._id}`)
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });
});


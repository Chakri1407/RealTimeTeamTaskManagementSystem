import request from 'supertest';
import createApp from '../app';
import {
  createTestUserWithToken,
  createTestTeam,
  createTestProject,
  getAuthHeader,
} from './helpers/testHelpers';

const app = createApp();

describe('Project API', () => {
  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);

      const res = await request(app)
        .post('/api/projects')
        .set(getAuthHeader(tokens.accessToken))
        .send({
          name: 'New Project',
          description: 'Project description',
          team: team._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Project');
      expect(res.body.data.status).toBe('Planning');
    });

    it('should fail for non-team member', async () => {
      const { user } = await createTestUserWithToken();
      const { tokens: otherTokens } = await createTestUserWithToken({
        email: 'other@example.com',
      });
      const team = await createTestTeam(user._id);

      const res = await request(app)
        .post('/api/projects')
        .set(getAuthHeader(otherTokens.accessToken))
        .send({
          name: 'New Project',
          team: team._id.toString(),
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should fail for non-member', async () => {
      const { user } = await createTestUserWithToken();
      const { tokens: otherTokens } = await createTestUserWithToken({
        email: 'other@example.com',
      });
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);

      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set(getAuthHeader(otherTokens.accessToken));

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update project', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);

      const res = await request(app)
        .put(`/api/projects/${project._id}`)
        .set(getAuthHeader(tokens.accessToken))
        .send({
          name: 'Updated Project',
          status: 'Active',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Project');
      expect(res.body.data.status).toBe('Active');
    });
  });

  describe('GET /api/projects/:id/stats', () => {
    it('should return project statistics', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);

      const res = await request(app)
        .get(`/api/projects/${project._id}/stats`)
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.project).toBeDefined();
      expect(res.body.data.tasks).toBeDefined();
      expect(res.body.data.tasks.total).toBe(0);
      expect(res.body.data.tasks.completionRate).toBe(0);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete project as creator', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);

      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });
});


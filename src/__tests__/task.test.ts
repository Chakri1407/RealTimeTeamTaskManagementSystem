import request from 'supertest';
import createApp from '../app';
import { TaskStatus, TaskPriority } from '../types/enums';
import {
  createTestUserWithToken,
  createTestTeam,
  createTestProject,
  createTestTask,
  getAuthHeader,
} from './helpers/testHelpers';

const app = createApp();

describe('Task API', () => {
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);

      const res = await request(app)
        .post('/api/tasks')
        .set(getAuthHeader(tokens.accessToken))
        .send({
          title: 'New Task',
          description: 'Task description',
          project: project._id.toString(),
          priority: TaskPriority.HIGH,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Task');
      expect(res.body.data.status).toBe(TaskStatus.TODO);
      expect(res.body.data.priority).toBe(TaskPriority.HIGH);
    });

    it('should create task with assignee', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);

      const res = await request(app)
        .post('/api/tasks')
        .set(getAuthHeader(tokens.accessToken))
        .send({
          title: 'Assigned Task',
          project: project._id.toString(),
          assignedTo: user._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.data.assignedTo).toBeDefined();
    });

    it('should fail for non-team member', async () => {
      const { user } = await createTestUserWithToken();
      const { tokens: otherTokens } = await createTestUserWithToken({
        email: 'other@example.com',
      });
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);

      const res = await request(app)
        .post('/api/tasks')
        .set(getAuthHeader(otherTokens.accessToken))
        .send({
          title: 'New Task',
          project: project._id.toString(),
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/tasks/my-tasks', () => {
    it('should return tasks assigned to user', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      await createTestTask(project._id, user._id, {
        title: 'My Task',
        assignedTo: user._id,
      });

      const res = await request(app)
        .get('/api/tasks/my-tasks')
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('My Task');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return task by ID', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      const task = await createTestTask(project._id, user._id, {
        title: 'Test Task',
      });

      const res = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Test Task');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      const task = await createTestTask(project._id, user._id);

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set(getAuthHeader(tokens.accessToken))
        .send({
          title: 'Updated Task',
          priority: TaskPriority.URGENT,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Task');
      expect(res.body.data.priority).toBe(TaskPriority.URGENT);
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    it('should update task status (TODO -> IN_PROGRESS)', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      const task = await createTestTask(project._id, user._id, {
        status: TaskStatus.TODO,
      });

      const res = await request(app)
        .patch(`/api/tasks/${task._id}/status`)
        .set(getAuthHeader(tokens.accessToken))
        .send({ status: TaskStatus.IN_PROGRESS });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should update task status (IN_PROGRESS -> REVIEW)', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      const task = await createTestTask(project._id, user._id, {
        status: TaskStatus.IN_PROGRESS,
      });

      const res = await request(app)
        .patch(`/api/tasks/${task._id}/status`)
        .set(getAuthHeader(tokens.accessToken))
        .send({ status: TaskStatus.REVIEW });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(TaskStatus.REVIEW);
    });

    it('should fail invalid status transition (TODO -> DONE)', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      const task = await createTestTask(project._id, user._id, {
        status: TaskStatus.TODO,
      });

      const res = await request(app)
        .patch(`/api/tasks/${task._id}/status`)
        .set(getAuthHeader(tokens.accessToken))
        .send({ status: TaskStatus.DONE });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/tasks/:id/assign', () => {
    it('should assign task to user', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      const task = await createTestTask(project._id, user._id);

      const res = await request(app)
        .patch(`/api/tasks/${task._id}/assign`)
        .set(getAuthHeader(tokens.accessToken))
        .send({ userId: user._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.data.assignedTo).toBeDefined();
    });
  });

  describe('PATCH /api/tasks/:id/unassign', () => {
    it('should unassign task', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      const task = await createTestTask(project._id, user._id, {
        assignedTo: user._id,
      });

      const res = await request(app)
        .patch(`/api/tasks/${task._id}/unassign`)
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data.assignedTo).toBeUndefined();
    });
  });

  describe('GET /api/projects/:projectId/tasks', () => {
    it('should return all tasks for a project', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      await createTestTask(project._id, user._id, { title: 'Task 1' });
      await createTestTask(project._id, user._id, { title: 'Task 2' });

      const res = await request(app)
        .get(`/api/projects/${project._id}/tasks`)
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      await createTestTask(project._id, user._id, { status: TaskStatus.TODO });
      await createTestTask(project._id, user._id, { status: TaskStatus.IN_PROGRESS });

      const res = await request(app)
        .get(`/api/projects/${project._id}/tasks`)
        .query({ status: TaskStatus.TODO })
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe(TaskStatus.TODO);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task as creator', async () => {
      const { user, tokens } = await createTestUserWithToken();
      const team = await createTestTeam(user._id);
      const project = await createTestProject(team._id, user._id);
      const task = await createTestTask(project._id, user._id);

      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted');
    });
  });
});


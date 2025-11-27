import request from 'supertest';
import createApp from '../app';
import { createTestUser, createTestUserWithToken, getAuthHeader } from './helpers/testHelpers';

const app = createApp();

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should fail if email already exists', async () => {
      await createTestUser({ email: 'existing@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Doe',
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      await createTestUser({
        email: 'login@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      await createTestUser({
        email: 'wrongpass@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token successfully', async () => {
      const { tokens } = await createTestUserWithToken();

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: tokens.refreshToken,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile', async () => {
      const { tokens } = await createTestUserWithToken({
        name: 'Profile User',
        email: 'profile@example.com',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set(getAuthHeader(tokens.accessToken));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('profile@example.com');
      expect(res.body.data.name).toBe('Profile User');
    });

    it('should fail without auth token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set(getAuthHeader('invalid-token'));

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/me', () => {
    it('should update user profile', async () => {
      const { tokens } = await createTestUserWithToken({
        name: 'Old Name',
      });

      const res = await request(app)
        .put('/api/auth/me')
        .set(getAuthHeader(tokens.accessToken))
        .send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Name');
    });
  });
});


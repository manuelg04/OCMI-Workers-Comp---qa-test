import request from 'supertest';
import { makeExpressApp } from '../../src/lib';
import { userRepository, sessionRepository } from '../../src/database';
import { createMockUser, createMockSession } from '../helpers/mockData';
import { User, Session } from '../../../../packages/shared/src/types';

describe('Users API', () => {
  const app = makeExpressApp();
  let mockUser: User;
  let mockSession: Session;

  beforeEach(() => {
    mockUser = createMockUser();
    mockSession = createMockSession(mockUser.id);

    jest.spyOn(userRepository, 'find').mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'findByUsername').mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'findByCredentials').mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'update').mockResolvedValue(mockUser);
    jest.spyOn(userRepository, 'register').mockResolvedValue(mockUser);
    jest.spyOn(sessionRepository, 'create').mockResolvedValue(mockSession);
    jest
      .spyOn(sessionRepository, 'findByToken')
      .mockImplementation(async (token) =>
        token === mockSession.token ? mockSession : null,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('POST /users', () => {
    it('should register a new user and create a session', async () => {
      const newUser = {
        username: 'newuser',
        password: 'newpassword123',
      };

      const expectedUser = {
        ...mockUser,
        id: '2',
        username: newUser.username,
      };

      const expectedSession = {
        ...mockSession,
        id: '2',
        userId: expectedUser.id,
      };

      jest.spyOn(userRepository, 'register').mockResolvedValue(expectedUser);
      jest.spyOn(sessionRepository, 'create').mockResolvedValue(expectedSession);

      const response = await request(app).post('/users').send(newUser);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...expectedSession,
        createdAt: expectedSession.createdAt.toISOString(),
      });
    });

    it('should return 422 if data is invalid', async () => {
      const invalidUser = {
        username: 'a',
        password: 'short',
      };

      const response = await request(app).post('/users').send(invalidUser);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /users/:userId', () => {
    it('should get a user by id', async () => {
      const response = await request(app)
        .get(`/users/${mockUser.id}`)
        .set('Authorization', mockSession.token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUser,
        favoriteBook: mockUser.favoriteBook
          ? JSON.parse(mockUser.favoriteBook)
          : undefined,
      });
    });

    it('should return 404 if user not found', async () => {
      jest
        .spyOn(userRepository, 'find')
        .mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .get('/users/non-existent-id')
        .set('Authorization', mockSession.token);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

  });

  describe('PUT /users/:userId', () => {
    it('should update the user information', async () => {
      const updatedData = {
        username: 'updatedUsername',
        favoriteBook: {
          key: 'OL123M',
          title: 'Example Book Title',
          author_name: ['Author One', 'Author Two'],
          first_publish_year: 1999,
        },
      };

      const updatedUser = {
        ...mockUser,
        ...updatedData,
        favoriteBook: JSON.stringify(updatedData.favoriteBook),
      };

      jest.spyOn(userRepository, 'update').mockResolvedValue(updatedUser);

      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .set('Authorization', mockSession.token)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
    });

    it('should return 422 if data is invalid', async () => {
      const invalidData = {
        username: 'ab',
      };

      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .set('Authorization', mockSession.token)
        .send(invalidData);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 if user not found', async () => {
      jest
        .spyOn(userRepository, 'find')
        .mockRejectedValue(new Error('User not found'));

      const updatedData = {
        username: 'updatedUsername',
        favoriteBook: {
          key: 'OL123M',
          title: 'Example Book Title',
          author_name: ['Author One', 'Author Two'],
          first_publish_year: 1999,
        },
      };

      const response = await request(app)
        .put('/users/non-existent-id')
        .set('Authorization', mockSession.token)
        .send(updatedData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Internal server error' });
    });

  });
});

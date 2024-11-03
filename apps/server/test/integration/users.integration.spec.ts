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
    it('must register a new user and create a session', async () => {
      const newUser = {
        username: 'newuser',
        password: 'newpassword123',
      };

      const expectedUser = {
        ...mockUser,
        username: newUser.username,
      };

      jest.spyOn(userRepository, 'register').mockResolvedValue(expectedUser);
      jest.spyOn(sessionRepository, 'create').mockResolvedValue({
        ...mockSession,
        userId: expectedUser.id,
      });

      const response = await request(app).post('/users').send(newUser);

      expect(response.status).toBe(200);

      const expectedSession = {
        ...mockSession,
        userId: expectedUser.id,
        createdAt: mockSession.createdAt.toISOString(),
      };

      expect(response.body).toEqual(expectedSession);
      expect(userRepository.register).toHaveBeenCalledWith(newUser);
      expect(sessionRepository.create).toHaveBeenCalledWith(expectedUser);
    });
  });

  describe('GET /users/:userId', () => {
    it('must get a user by id', async () => {
      const userId = mockUser.id;

      const response = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${mockSession.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUser,
        favoriteBook: undefined,
      });
      expect(userRepository.find).toHaveBeenCalledWith(userId);
    });

    it('must return a 404 error if the user does not exist', async () => {
      const userId = 'non-existent-id';
      jest
        .spyOn(userRepository, 'find')
        .mockImplementation(async () => {
          throw new Error('User not found');
        });

      const response = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${mockSession.token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'User not found' });
    });

  });

  describe('PUT /users/:userId', () => {
    it('must update the user information', async () => {
      const userId = mockUser.id;
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


      jest.spyOn(userRepository, 'find').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'update').mockResolvedValue(updatedUser);

      const response = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${mockSession.token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);
    });

    it('must return a 500 error if the user does not exist', async () => {
      const userId = 'non-existent-id';
      const updatedData = {
        username: 'updatedUsername',
        favoriteBook: 'New Favorite Book',
      };

      jest
        .spyOn(userRepository, 'find')
        .mockRejectedValue(new Error('User not found'));

      const response = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${mockSession.token}`)
        .send(updatedData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Internal server error' });
    });

    it('must return a 422 error if the data is invalid', async () => {
      const invalidData = {
        username: '',
        favoriteBook: {
          key: '',
          title: '',
        },
      };

      const response = await request(app)
        .put(`/users/${mockUser.id}`)
        .set('Authorization', `Bearer ${mockSession.token}`)
        .send(invalidData);

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('errors');
    });
  });
});

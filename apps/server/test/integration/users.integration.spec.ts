// tests/integration/users.integration.spec.ts

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
    jest.spyOn(sessionRepository, 'create').mockResolvedValue(mockSession);
    jest
      .spyOn(sessionRepository, 'findByToken')
      .mockImplementation(async (token) =>
        token === mockSession.token ? mockSession : null,
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /users', () => {
    it('debería registrar un nuevo usuario y crear una sesión', async () => {
      const newUser = {
        username: 'newuser',
        password: 'newpassword123',
      };

      const expectedUser = {
        ...mockUser,
        username: newUser.username,
      };

      jest.spyOn(userRepository, 'register').mockResolvedValue(expectedUser);

      const response = await request(app).post('/users').send(newUser);

      expect(response.status).toBe(200);

      const expectedSession = {
        ...mockSession,
        createdAt: mockSession.createdAt.toISOString(),
      };

      expect(response.body).toEqual(expectedSession);
      expect(userRepository.register).toHaveBeenCalledWith(newUser);
      expect(sessionRepository.create).toHaveBeenCalledWith(expectedUser);
    });
  });

  describe('GET /users/:userId', () => {
    it('debería obtener un usuario por ID', async () => {
      const userId = mockUser.id;

      const response = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', mockSession.token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUser,
        favoriteBook: undefined,
      });
      expect(userRepository.find).toHaveBeenCalledWith(userId);
    });
  });
});

import { userRepository } from '../../src/database';

import { createMockUser } from '../helpers/mockData';
import { runDbStmt, getDbRows } from '../../src/lib';
import bcrypt from 'bcrypt';
import { User } from '../../../../packages/shared/src/types';

jest.mock('../../src/lib', () => ({
  ...jest.requireActual('../../src/lib'),
  runDbStmt: jest.fn(),
  getDbRows: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  hashSync: jest.fn(),
  compareSync: jest.fn(),
}));

describe('User Repository', () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = createMockUser();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('must register a new user', async () => {
      const runDbStmtMock = runDbStmt as jest.Mock;
      runDbStmtMock.mockResolvedValue({ lastID: mockUser.id });

      const getDbRowsMock = getDbRows as jest.Mock;
      getDbRowsMock.mockResolvedValue([mockUser]);

      const hashSyncMock = bcrypt.hashSync as jest.Mock;
      hashSyncMock.mockReturnValue(mockUser.password);

      const userData = {
        username: mockUser.username,
        password: 'password123',
      };

      const result = await userRepository.register(userData);

      expect(hashSyncMock).toHaveBeenCalledWith('password123', 10);
      expect(runDbStmtMock).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [mockUser.username, mockUser.password],
      );
      expect(getDbRowsMock).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE id = ?'),
        [mockUser.id],
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('find', () => {
    it('must find a user by id', async () => {
      const getDbRowsMock = getDbRows as jest.Mock;
      getDbRowsMock.mockResolvedValue([mockUser]);

      const result = await userRepository.find(mockUser.id);

      expect(getDbRowsMock).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [mockUser.id],
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if the user does not exist', async () => {
      const getDbRowsMock = getDbRows as jest.Mock;
      getDbRowsMock.mockResolvedValue([]);

      await expect(userRepository.find('non-existent-id')).rejects.toThrow(
        'User with id non-existent-id not found',
      );
      expect(getDbRowsMock).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        ['non-existent-id'],
      );
    });
  });

  describe('findByUsername', () => {
    it('must find a user by username', async () => {
      const getDbRowsMock = getDbRows as jest.Mock;
      getDbRowsMock.mockResolvedValue([mockUser]);

      const result = await userRepository.findByUsername(mockUser.username);

      expect(getDbRowsMock).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        [mockUser.username],
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined if the user does not exist', async () => {
      const getDbRowsMock = getDbRows as jest.Mock;
      getDbRowsMock.mockResolvedValue([]);

      const result = await userRepository.findByUsername('non-existent-user');

      expect(getDbRowsMock).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['non-existent-user'],
      );
      expect(result).toBeUndefined();
    });
  });

  describe('findByCredentials', () => {
    it('must return the user if the credentials are valid', async () => {
      const findByUsernameMock = jest.spyOn(userRepository, 'findByUsername');
      findByUsernameMock.mockResolvedValue(mockUser);

      const compareSyncMock = bcrypt.compareSync as jest.Mock;
      compareSyncMock.mockReturnValue(true);

      const credentials = {
        username: mockUser.username,
        password: 'password123',
      };

      const result = await userRepository.findByCredentials(credentials);

      expect(findByUsernameMock).toHaveBeenCalledWith(mockUser.username);
      expect(compareSyncMock).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password,
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if the user does not exist', async () => {
      const findByUsernameMock = jest.spyOn(userRepository, 'findByUsername');
      findByUsernameMock.mockResolvedValue(null);

      const credentials = {
        username: 'non-existent-user',
        password: 'password123',
      };

      const result = await userRepository.findByCredentials(credentials);

      expect(findByUsernameMock).toHaveBeenCalledWith('non-existent-user');
      expect(result).toBeNull();
    });

    it('should return null if the password is incorrect', async () => {
      const findByUsernameMock = jest.spyOn(userRepository, 'findByUsername');
      findByUsernameMock.mockResolvedValue(mockUser);

      const compareSyncMock = bcrypt.compareSync as jest.Mock;
      compareSyncMock.mockReturnValue(false);

      const credentials = {
        username: mockUser.username,
        password: 'wrongpassword',
      };

      const result = await userRepository.findByCredentials(credentials);

      expect(findByUsernameMock).toHaveBeenCalledWith(mockUser.username);
      expect(compareSyncMock).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password,
      );
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('must update the user information', async () => {
      const findMock = jest.spyOn(userRepository, 'find');
      findMock.mockResolvedValueOnce(mockUser);

      const runDbStmtMock = runDbStmt as jest.Mock;
      runDbStmtMock.mockResolvedValue({});

      const updatedUser = {
        ...mockUser,
        username: 'updatedUsername',
        favoriteBook: 'New Favorite Book',
      };

      const getDbRowsMock = getDbRows as jest.Mock;
      getDbRowsMock.mockResolvedValueOnce([updatedUser]);

      const updatedData = {
        username: 'updatedUsername',
        favoriteBook: 'New Favorite Book',
      };

      const result = await userRepository.update(mockUser.id, updatedData);

      expect(findMock).toHaveBeenCalledWith(mockUser.id);
      expect(runDbStmtMock).toHaveBeenCalledWith(
        'UPDATE users SET username = ?, password = ?, favoriteBook = ? WHERE id = ?',
        [
          updatedData.username,
          mockUser.password,
          updatedData.favoriteBook,
          mockUser.id,
        ],
      );
      expect(getDbRowsMock).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [mockUser.id],
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error if the user does not exist', async () => {
      const findMock = jest.spyOn(userRepository, 'find');
      findMock.mockRejectedValue(new Error('User not found'));

      const updatedData = {
        username: 'updatedUsername',
        favoriteBook: 'New Favorite Book',
      };

      await expect(
        userRepository.update('non-existent-id', updatedData),
      ).rejects.toThrow('User not found');
      expect(findMock).toHaveBeenCalledWith('non-existent-id');
    });
  });
});

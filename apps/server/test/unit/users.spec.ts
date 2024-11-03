import { userRepository } from '../../src/database';
import { User } from '../../../../packages/shared/src/types';
import { createMockUser } from '../helpers/mockData';
import { runDbStmt, getDbRows } from '../../src/lib';
import bcrypt from 'bcrypt';

jest.mock('../../src/lib', () => ({
  ...jest.requireActual('../../src/lib'),
  runDbStmt: jest.fn(),
  getDbRows: jest.fn(),
}));

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  hashSync: jest.fn(),
}));

describe('User Repository', () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = createMockUser();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
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

});

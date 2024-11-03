import { userRepository } from '../../src/database';
import { User } from '../../../../packages/shared/src/types';
import { createMockUser } from '../helpers/mockData';

describe('User Repository', () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = createMockUser();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario', async () => {
      jest.spyOn(userRepository, 'register').mockResolvedValue(mockUser);

      const result = await userRepository.register({
        username: mockUser.username,
        password: 'password123',
      });

      expect(userRepository.register).toHaveBeenCalledWith({
        username: mockUser.username,
        password: 'password123',
      });
      expect(result).toEqual(mockUser);
    });
  });

});

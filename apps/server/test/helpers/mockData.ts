
import bcrypt from 'bcrypt';
import { Post } from '../../../../packages/shared/src/types';
import { Session } from '../../../../packages/shared/src/types';
import { User } from '../../../../packages/shared/src/types';


export const currentDate = new Date();

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: '1',
  username: 'testuser',
  password: bcrypt.hashSync('password123', 10),
  favoriteBook: undefined,
  ...overrides,
});

export const createMockSession = (userId: string, overrides?: Partial<Session>): Session => ({
  id: '1',
  userId,
  token: 'test-session-token',
  createdAt: currentDate,
  ...overrides,
});

export const createMockPost = (authorId: string, overrides?: Partial<Post>): Post => ({
  id: '1',
  title: 'Test Post',
  content: 'This is a test post',
  authorId,
  createdAt: currentDate,
  updatedAt: currentDate,
  ...overrides,
});

import request from 'supertest';
import { postRepository } from '../database';
import { Post, User, Session } from '@qa-assessment/shared';
import { makeExpressApp } from '../lib';
import { sessionRepository } from '../database';
import bcrypt from 'bcrypt';

describe('Posts API', () => {
  const app = makeExpressApp();
  let mockUser: User;
  let mockSession: Session;
  let mockPost: Post;
  const currentDate = new Date();

  beforeEach(() => {
    mockUser = {
      id: '1',
      username: 'testuser',
      password: bcrypt.hashSync('password123', 10),
    };

    mockSession = {
      id: '1',
      userId: mockUser.id,
      token: 'test-session-token',
      createdAt: currentDate,
    };

    mockPost = {
      id: '1',
      authorId: mockUser.id,
      title: 'Test Post',
      content: 'This is a test post',
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    jest.spyOn(postRepository, 'create').mockResolvedValue(mockPost);
    jest.spyOn(postRepository, 'find').mockResolvedValue(mockPost);
    jest.spyOn(postRepository, 'update').mockResolvedValue(mockPost);
    jest.spyOn(postRepository, 'delete').mockResolvedValue(undefined);

    jest
      .spyOn(sessionRepository, 'findByToken')
      .mockImplementation(async (token) =>
        token === mockSession.token ? mockSession : null,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /posts', () => {
    it('debería crear un nuevo post', async () => {
      const newPostData = {
        title: 'New Post',
        content: 'Content of the new post',
      };

      const expectedPost = {
        ...mockPost,
        title: newPostData.title,
        content: newPostData.content,
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
      };

      jest.spyOn(postRepository, 'create').mockResolvedValue({
        ...mockPost,
        ...newPostData,
      });

      const response = await request(app)
        .post('/posts')
        .set('Authorization', mockSession.token)
        .send(newPostData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expectedPost);
      expect(postRepository.create).toHaveBeenCalledTimes(1);
      expect(postRepository.create).toHaveBeenCalledWith({
        ...newPostData,
        authorId: mockUser.id,
      });
    });
  });

});

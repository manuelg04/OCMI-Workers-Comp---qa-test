import request from 'supertest';
import { makeExpressApp } from '../../src/lib';
import { postRepository, sessionRepository } from '../../src/database';
import {
  createMockUser,
  createMockSession,
  createMockPost,
  currentDate,
} from '../helpers/mockData';
import { User, Session, Post } from '../../../../packages/shared/src/types';

describe('Posts API', () => {
  const app = makeExpressApp();
  let mockUser: User;
  let mockSession: Session;
  let mockPost: Post;

  beforeEach(() => {
    mockUser = createMockUser();
    mockSession = createMockSession(mockUser.id);
    mockPost = createMockPost(mockUser.id);

    jest
      .spyOn(sessionRepository, 'findByToken')
      .mockImplementation(async (token) =>
        token === mockSession.token ? mockSession : null,
      );

    jest.spyOn(postRepository, 'create').mockResolvedValue(mockPost);
    jest.spyOn(postRepository, 'find').mockResolvedValue(mockPost);
    jest.spyOn(postRepository, 'update').mockResolvedValue(mockPost);
    jest.spyOn(postRepository, 'delete').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /posts', () => {
    it('debería crear un nuevo post', async () => {
      const newPostData = {
        title: 'New Post',
        content: 'Content of the new post',
      };

      const expectedPost = {
        ...mockPost,
        ...newPostData,
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
      expect(postRepository.create).toHaveBeenCalledWith({
        ...newPostData,
        authorId: mockUser.id,
      });
    });
  });

  describe('GET /posts/:id', () => {
    it('debería obtener un post por ID', async () => {
      const postId = mockPost.id;

      const response = await request(app)
        .get(`/posts/${postId}`)
        .set('Authorization', mockSession.token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockPost,
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString(),
      });
      expect(postRepository.find).toHaveBeenCalledWith(postId);
    });

    it('debería devolver 404 si el post no existe', async () => {
      const postId = 'non-existent-id';
      jest
        .spyOn(postRepository, 'find')
        .mockRejectedValue(new Error('Post not found'));

      const response = await request(app)
        .get(`/posts/${postId}`)
        .set('Authorization', mockSession.token);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });

  describe('PUT /posts/:id', () => {
    it('debería actualizar un post existente', async () => {
      const postId = mockPost.id;
      const updatedPostData = {
        title: 'Updated Post Title',
        content: 'Updated content of the post',
      };

      const updatedMockPost = {
        ...mockPost,
        ...updatedPostData,
        updatedAt: currentDate,
      };

      jest.spyOn(postRepository, 'update').mockResolvedValue(updatedMockPost);

      const expectedPost = {
        ...updatedMockPost,
        createdAt: mockPost.createdAt.toISOString(),
        updatedAt: updatedMockPost.updatedAt.toISOString(),
      };

      const response = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', mockSession.token)
        .send(updatedPostData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedPost);
      expect(postRepository.update).toHaveBeenCalledWith(
        postId,
        expect.objectContaining(updatedPostData),
      );
    });

    it('debería devolver 404 si el post no existe', async () => {
      const postId = 'non-existent-id';

      jest
        .spyOn(postRepository, 'find')
        .mockRejectedValue(new Error('Post not found'));

      const response = await request(app)
        .put(`/posts/${postId}`)
        .set('Authorization', mockSession.token)
        .send({ title: 'Title', content: 'Content' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });

  describe('DELETE /posts/:id', () => {
    it('debería eliminar un post por ID', async () => {
      const postId = mockPost.id;

      const response = await request(app)
        .delete(`/posts/${postId}`)
        .set('Authorization', mockSession.token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Post deleted' });
      expect(postRepository.delete).toHaveBeenCalledWith(postId);
    });

    it('debería devolver 404 si el post no existe', async () => {
      const postId = 'non-existent-id';
      jest
        .spyOn(postRepository, 'delete')
        .mockRejectedValue(new Error('Post not found'));

      const response = await request(app)
        .delete(`/posts/${postId}`)
        .set('Authorization', mockSession.token);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Post not found' });
    });
  });
});

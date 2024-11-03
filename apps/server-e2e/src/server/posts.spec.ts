import axios from 'axios';
import { Post, Session } from '@qa-assessment/shared';

describe('Posts API', () => {
  let authToken: string;
  let userId: string;
  let createdPost: Post;

  beforeAll(async () => {
    const username = `testuser_${Math.random().toString(36).substring(7)}`;
    const password = 'password123';

    const registerResponse = await axios.post<Session>('/users', {
      username,
      password,
    });

    expect(registerResponse.status).toBe(200);
    authToken = registerResponse.data.token;
    userId = registerResponse.data.userId;

    axios.defaults.headers.common['Authorization'] = authToken;
  });

  afterAll(() => {
    delete axios.defaults.headers.common['Authorization'];
  });

  describe('POST /posts', () => {
    it('should create a new post successfully', async () => {
      const postData = {
        title: 'Test Post Title',
        content: 'This is a test post content.',
      };

      const createResponse = await axios.post<Post>('/posts', postData);

      expect(createResponse.status).toBe(201);

      createdPost = createResponse.data;
      expect(createdPost).toMatchObject({
        title: postData.title,
        content: postData.content,
        authorId: userId,
      });

      expect(createdPost.id).toBeDefined();
      expect(createdPost.createdAt).toBeDefined();
      expect(createdPost.updatedAt).toBeDefined();
    });

    it('should reject post creation with invalid data', async () => {
      const invalidPost = {
        title: '',
        content: 'Test content',
      };

      try {
        await axios.post('/posts', invalidPost);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.errors).toBeDefined();
      }
    });

    it('should reject unauthorized post creation', async () => {
      delete axios.defaults.headers.common['Authorization'];

      try {
        await axios.post('/posts', {
          title: 'Unauthorized Post',
          content: 'This should fail',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }

      axios.defaults.headers.common['Authorization'] = authToken;
    });
  });

  describe('GET /posts/:id', () => {
    it('should retrieve the created post', async () => {
      expect(createdPost).toBeDefined();

      const getResponse = await axios.get<Post>(`/posts/${createdPost.id}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.data).toEqual(createdPost);
    });

    it('should return 404 for non-existent post', async () => {
      try {
        await axios.get('/posts/non-existent-id');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('GET /posts', () => {
    it('should retrieve all posts', async () => {
      const getAllResponse = await axios.get<Post[]>('/posts');

      expect(getAllResponse.status).toBe(200);
      expect(Array.isArray(getAllResponse.data)).toBe(true);

      const posts = getAllResponse.data;
      const foundPost = posts.find((post) => post.id === createdPost.id);

      expect(foundPost).toBeDefined();
      expect(foundPost).toEqual(createdPost);
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update the post successfully', async () => {
      const updatedData = {
        title: 'Updated Post Title',
        content: 'This is updated content.',
      };

      const updateResponse = await axios.put<Post>(`/posts/${createdPost.id}`, updatedData);

      expect(updateResponse.status).toBe(200);

      const updatedPost = updateResponse.data;
      expect(updatedPost).toMatchObject({
        id: createdPost.id,
        authorId: userId,
        title: updatedData.title,
        content: updatedData.content,
      });

      expect(new Date(updatedPost.updatedAt).getTime()).toBeGreaterThan(
        new Date(updatedPost.createdAt).getTime()
      );

      const getResponse = await axios.get<Post>(`/posts/${createdPost.id}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.data).toEqual(updatedPost);

      createdPost = updatedPost;
    });

    it('should reject unauthorized post update', async () => {
      delete axios.defaults.headers.common['Authorization'];

      try {
        await axios.put(`/posts/${createdPost.id}`, {
          title: 'Unauthorized Update',
          content: 'This should fail',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }

      axios.defaults.headers.common['Authorization'] = authToken;
    });

    it('should return 404 when updating non-existent post', async () => {
      const nonExistentPostId = 'non-existent-id';

      try {
        await axios.put(`/posts/${nonExistentPostId}`, {
          title: 'Updated Title',
          content: 'Updated Content',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete the post successfully', async () => {
      const deleteResponse = await axios.delete(`/posts/${createdPost.id}`);

      expect(deleteResponse.status).toBe(200);

      try {
        await axios.get(`/posts/${createdPost.id}`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should reject unauthorized post deletion', async () => {
      delete axios.defaults.headers.common['Authorization'];

      try {
        await axios.delete(`/posts/${createdPost.id}`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }

      axios.defaults.headers.common['Authorization'] = authToken;
    });

    it('should return 404 when deleting non-existent post', async () => {
      const nonExistentPostId = 'non-existent-id';

      try {
        await axios.delete(`/posts/${nonExistentPostId}`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response).toBeUndefined();
      }
    });
  });
});

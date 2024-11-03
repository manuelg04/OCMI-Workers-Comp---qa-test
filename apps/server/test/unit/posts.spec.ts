import { postRepository } from '../../src/database';
import { Post } from '../../../../packages/shared/src/types';
import { createMockPost, currentDate } from '../helpers/mockData';
import { runDbStmt, getDbRows } from '../../src/lib';

jest.mock('../../src/lib', () => ({
  ...jest.requireActual('../../src/lib'),
  runDbStmt: jest.fn(),
  getDbRows: jest.fn(),
}));

describe('Post Repository', () => {
  let mockPost: Post;

  beforeEach(() => {
    mockPost = createMockPost('1');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('must create a new post in the database', async () => {
      const runDbStmtMock = runDbStmt as jest.Mock;
      runDbStmtMock.mockResolvedValue({ lastID: mockPost.id });

      const getDbRowsMock = getDbRows as jest.Mock;
      getDbRowsMock.mockResolvedValue([
        {
          ...mockPost,
          createdAt: mockPost.createdAt.toISOString(),
          updatedAt: mockPost.updatedAt.toISOString(),
        },
      ]);

      const postData = {
        title: mockPost.title,
        content: mockPost.content,
        authorId: mockPost.authorId,
      };

      const result = await postRepository.create(postData);

      expect(runDbStmtMock).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO posts'),
        expect.arrayContaining([
          postData.title,
          postData.content,
          postData.authorId,
          expect.any(String),
          expect.any(String),
        ]),
      );

      expect(getDbRowsMock).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM posts WHERE id = ?'),
        [mockPost.id],
      );

      expect(result).toEqual({
        ...mockPost,
        createdAt: new Date(mockPost.createdAt.toISOString()),
        updatedAt: new Date(mockPost.updatedAt.toISOString()),
      });
    });
  });

  describe('find', () => {
    it('must find a post by id', async () => {
      // Arrange
      const getDbRowsMock = getDbRows as jest.Mock;
      getDbRowsMock.mockResolvedValue([
        {
          ...mockPost,
          createdAt: mockPost.createdAt.toISOString(),
          updatedAt: mockPost.updatedAt.toISOString(),
        },
      ]);

      const result = await postRepository.find(mockPost.id);

      expect(getDbRowsMock).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM posts WHERE id = ?'),
        [mockPost.id],
      );
      expect(result).toEqual({
        ...mockPost,
        createdAt: new Date(mockPost.createdAt.toISOString()),
        updatedAt: new Date(mockPost.updatedAt.toISOString()),
      });
    });

    it('should throw an error if the post does not exist', async () => {
      const getDbRowsMock = getDbRows as jest.Mock;
      getDbRowsMock.mockResolvedValue([]);

      await expect(postRepository.find('non-existent-id')).rejects.toThrow(
        'Post with id non-existent-id not found',
      );
    });
  });

  describe('all', () => {
    it('must return all posts sorted by creation date in descending order', async () => {
      const getDbRowsMock = getDbRows as jest.Mock;
      const mockPosts = [
        {
          ...createMockPost('1'),
          createdAt: currentDate.toISOString(),
          updatedAt: currentDate.toISOString(),
        },
        {
          ...createMockPost('2'),
          createdAt: currentDate.toISOString(),
          updatedAt: currentDate.toISOString(),
        },
      ];
      getDbRowsMock.mockResolvedValue(mockPosts);

      const result = await postRepository.all();

      expect(getDbRowsMock).toHaveBeenCalledWith(
        'SELECT * FROM posts ORDER BY createdAt DESC',
      );
      expect(result).toEqual(
        mockPosts.map((post) => ({
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
        })),
      );
    });
  });

  describe('update', () => {
    let mockPost: Post;

    beforeEach(() => {
      mockPost = createMockPost('1');
    });

    it('must update an existing post', async () => {
      const runDbStmtMock = runDbStmt as jest.Mock;
      const getDbRowsMock = getDbRows as jest.Mock;

      runDbStmtMock.mockResolvedValue({});
      getDbRowsMock.mockResolvedValue([
        {
          ...mockPost,
          title: 'Updated Title',
          content: 'Updated Content',
          createdAt: mockPost.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      const updatedData = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const result = await postRepository.update(mockPost.id, updatedData);
      expect(runDbStmtMock).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE posts SET'),
        expect.arrayContaining([
          updatedData.title,
          updatedData.content,
          expect.any(String),
          mockPost.id,
        ]),
      );
      expect(getDbRowsMock).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM posts WHERE id = ?'),
        [mockPost.id],
      );
      expect(result).toEqual({
        ...mockPost,
        title: updatedData.title,
        content: updatedData.content,
        updatedAt: expect.any(Date),
      });
    });

    it('should throw an error if the post does not exist', async () => {
      const runDbStmtMock = runDbStmt as jest.Mock;
      const getDbRowsMock = getDbRows as jest.Mock;

      runDbStmtMock.mockResolvedValue({});
      getDbRowsMock.mockResolvedValue([]);

      const updatedData = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      await expect(
        postRepository.update('non-existent-id', updatedData),
      ).rejects.toThrow('Post with id non-existent-id not found');
      expect(runDbStmtMock).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE posts SET'),
        expect.arrayContaining([
          updatedData.title,
          updatedData.content,
          expect.any(String),
          'non-existent-id',
        ]),
      );
      expect(getDbRowsMock).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM posts WHERE id = ?'),
        ['non-existent-id'],
      );
    });
  });

  describe('delete', () => {
    it('must delete an existing post', async () => {
      const runDbStmtMock = runDbStmt as jest.Mock;
      runDbStmtMock.mockResolvedValue({ changes: 1 });

      await postRepository.delete(mockPost.id);

      expect(runDbStmtMock).toHaveBeenCalledWith(
        'DELETE FROM posts WHERE id = ?',
        [mockPost.id],
      );
      expect(runDbStmtMock).toHaveBeenCalledTimes(1);
    });

    it('should execute without error when the post does not exist', async () => {
      const runDbStmtMock = runDbStmt as jest.Mock;
      runDbStmtMock.mockResolvedValue({ changes: 0 });

      await postRepository.delete('non-existent-id');

      expect(runDbStmtMock).toHaveBeenCalledWith(
        'DELETE FROM posts WHERE id = ?',
        ['non-existent-id'],
      );
      expect(runDbStmtMock).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors', async () => {
      const runDbStmtMock = runDbStmt as jest.Mock;
      runDbStmtMock.mockRejectedValue(new Error('Database error'));

      await expect(postRepository.delete(mockPost.id)).rejects.toThrow(
        'Database error',
      );
    });
  });
});

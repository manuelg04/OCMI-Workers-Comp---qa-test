import { postRepository } from '../../src/database';
import { Post } from '../../../../packages/shared/src/types';
import { createMockPost } from '../helpers/mockData';

describe('Post Repository', () => {
  let mockPost: Post;

  beforeEach(() => {
    mockPost = createMockPost('1');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('debería crear un nuevo post en la base de datos', async () => {
      jest.spyOn(postRepository, 'create').mockResolvedValue(mockPost);

      const result = await postRepository.create({
        title: mockPost.title,
        content: mockPost.content,
        authorId: mockPost.authorId,
      });

      expect(postRepository.create).toHaveBeenCalledWith({
        title: mockPost.title,
        content: mockPost.content,
        authorId: mockPost.authorId,
      });
      expect(result).toEqual(mockPost);
    });
  });

});

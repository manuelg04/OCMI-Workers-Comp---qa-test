import { PostRepository } from './types';
import { getDbRows, runDbStmt } from '../lib';

export const postRepository: PostRepository = {
  find: async (id) =>
    getDbRows(`SELECT * FROM posts WHERE id = ?`, [id]).then((result) => {
      if (result.length === 0) {
        throw new Error(`Post with id ${id} not found`);
      }
      return {
        ...result[0],
        createdAt: new Date(result[0].createdAt),
        updatedAt: new Date(result[0].updatedAt),
      };
    }),

  all: async () =>
    getDbRows(`SELECT * FROM posts ORDER BY createdAt DESC`).then((posts) =>
      posts.map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      })),
    ),

  create: async ({ title, content, authorId }) => {
    const now = new Date().toISOString();
    return runDbStmt(
      `INSERT INTO posts (title, content, authorId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      [title, content, authorId, now, now],
    ).then(({ lastID }) => postRepository.find(String(lastID)));
  },

  update: async (id, { title, content }) =>
    runDbStmt(
      `UPDATE posts SET title = ?, content = ?, updatedAt = ? WHERE id = ?`,
      [title, content, new Date().toISOString(), id],
    ).then(() => postRepository.find(id)),

  delete: async (id) => {
    await runDbStmt(`DELETE FROM posts WHERE id = ?`, [id]);
  },
};

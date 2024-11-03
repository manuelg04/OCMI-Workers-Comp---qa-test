import { SessionRepository } from './types';
import { generateRandomString, getDbRows, runDbStmt } from '../lib';

export const sessionRepository: SessionRepository = {
  find: (id) =>
    getDbRows(`SELECT * FROM sessions WHERE id = ?`, [id]).then((result) => {
      if (result.length === 0) {
        throw new Error(`Session with id ${id} not found`);
      }
      return {
        ...result[0],
        createdAt: new Date(result[0].createdAt),
      };
    }),

  findByToken: (token) =>
    getDbRows(`SELECT * FROM sessions WHERE token = ?`, [token]).then(
      (result) => {
        if (result.length === 0) {
          return null;
        }
        return {
          ...result[0],
          createdAt: new Date(result[0].createdAt),
        };
      },
    ),

  create: ({ id }) =>
    runDbStmt(`INSERT INTO sessions (userId, token) VALUES (?, ?)`, [
      id,
      generateRandomString(32),
    ]).then(({ lastID }) => sessionRepository.find(String(lastID))),

  delete: async (id) => {
    await runDbStmt(`DELETE FROM sessions WHERE id = ?`, [id]);
  },
};

import { UserRepository } from './types';
import { getDbRows, runDbStmt } from '../lib';
import bcrypt from 'bcrypt';

export const userRepository: UserRepository = {
  find: async (id) => {
    const result = await getDbRows(`SELECT * FROM users WHERE id = ?`, [id]);

    if (result.length === 0) {
      throw new Error(`User with id ${id} not found`);
    }

    return result[0];
  },

  findByUsername: async (username) =>
    getDbRows(`SELECT * FROM users WHERE username = ?`, [username]).then(
      (result) => result[0],
    ),

  findByCredentials: async ({ username, password }) => {
    const user = await userRepository.findByUsername(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return null;
    }

    return user;
  },

  update: async (id, { username, favoriteBook }) => {
    const user = await userRepository.find(id);
    const updatedUser = { ...user, username, favoriteBook };

    await runDbStmt(
      `UPDATE users SET username = ?, password = ?, favoriteBook = ? WHERE id = ?`,
      [
        updatedUser.username,
        updatedUser.password,
        updatedUser.favoriteBook,
        id,
      ],
    );

    return userRepository.find(id);
  },

  register: async ({ username, password }) =>
    runDbStmt(`INSERT INTO users (username, password) VALUES (?, ?)`, [
      username,
      bcrypt.hashSync(password, 10),
    ]).then(({ lastID }) => userRepository.find(String(lastID))),
};

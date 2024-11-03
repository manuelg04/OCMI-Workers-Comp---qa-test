/* Repositories */

import {Post, Session, User} from '@qa-assessment/shared';

export type UserRepository = {
  find: (id: string) => Promise<User>;
  findByUsername: (username: string) => Promise<User | null>;
  findByCredentials: ({
    username,
    password,
  }: Pick<User, 'username' | 'password'>) => Promise<User | null>;

  register: ({ username, password }: Omit<User, 'id'>) => Promise<User>;

  update: (
    id: string,
    user: { username: string; favoriteBook?: string },
  ) => Promise<User>;
};

export type PostRepository = {
  find: (id: string) => Promise<Post>;
  all: () => Promise<Post[]>;
  create: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Post>;
  update: (
    id: string,
    post: Partial<Pick<Post, 'title' | 'content'>>,
  ) => Promise<Post>;
  delete: (id: string) => Promise<void>;
};

export type SessionRepository = {
  find: (id: string) => Promise<Session>;
  findByToken: (token: string) => Promise<Session | null>;
  create: (user: User) => Promise<Session>;
  delete: (id: string) => Promise<void>;
};

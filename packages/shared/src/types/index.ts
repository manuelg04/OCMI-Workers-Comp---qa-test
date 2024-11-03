/* Models */

export type User = {
  id: string;
  username: string;
  password: string;
  favoriteBook?: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
};

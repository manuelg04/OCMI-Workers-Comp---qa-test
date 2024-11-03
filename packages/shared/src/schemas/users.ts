import { z } from 'zod';

export const userRegisterRequestSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(255)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores',
    ),
  password: z.string().min(8).max(255),
});

export const userUpdateRequestSchema = z
  .object({
    username: z.string().min(3).max(255),
    favoriteBook: z.object({
      key: z.string(),
      title: z.string(),
      author_name: z.array(z.string()).optional().nullable(),
      first_publish_year: z.number().optional().nullable(),
    }),
  })
  .partial();

import { z } from 'zod';

export const loginRequestSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

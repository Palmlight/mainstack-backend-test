import { z } from 'zod';

export const CreateUserSchema = z.object({
  fullName: z.string().min(6, 'Full name is required'),
  username: z.string().min(3, 'Username is required').trim().toLowerCase(),
  password: z.string(),
});

export interface CreateUserSchema extends z.infer<typeof CreateUserSchema> {}

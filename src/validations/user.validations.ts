import { z } from 'zod';

export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(15, 'Username must be less than 15 characters')
  .trim()
  .toLowerCase()
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: 'Username must contain only letters, numbers, and underscores',
  });

export const CreateUserSchema = z
  .object({
    fullName: z.string().min(2),
    username: UsernameSchema,
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .strict();

export interface CreateUserSchema extends z.infer<typeof CreateUserSchema> {}

export const LoginSchema = z.object({
  username: UsernameSchema,
  password: z.string(),
});

export interface LoginSchema extends z.infer<typeof LoginSchema> {}

export const ChangePasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .describe('Password'),
  })
  .strict();

export interface ChangePasswordSchema
  extends z.infer<typeof ChangePasswordSchema> {}

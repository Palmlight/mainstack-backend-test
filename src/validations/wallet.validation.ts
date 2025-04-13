import { Currency } from '@/constants';
import { z } from 'zod';
import { UsernameSchema } from './user.validations';

export const GetBalanceSchema = z.object({
  currency: z.enum(Object.values(Currency) as [string, ...string[]]),
});
export type GetBalanceSchema = z.infer<typeof GetBalanceSchema>;

export const DepositSchema = z.object({
  amount: z.number().positive('Please enter a valid amount').describe('Amount'),
  currency: z.enum(Object.values(Currency) as [string, ...string[]]),
});

export type DepositSchema = z.infer<typeof DepositSchema>;

export const TransferSchema = z.object({
  amount: z.number().positive('Please enter a valid amount').describe('Amount'),
  currency: z.enum(Object.values(Currency) as [string, ...string[]]),
  username: UsernameSchema,
});

export type TransferSchema = z.infer<typeof TransferSchema>;

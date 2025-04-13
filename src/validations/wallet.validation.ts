import { Currency } from '@/constants';
import { z } from 'zod';

export const GetBalanceSchema = z.object({
  currency: z.enum(Object.values(Currency) as [string, ...string[]]),
});
export type GetBalanceSchema = z.infer<typeof GetBalanceSchema>;

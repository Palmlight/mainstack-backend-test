import WalletController from '@/controllers/wallet.controller';
import { validateData } from '@/controllers/zod.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import catchAsyncError from '@/middlewares/catch-async-error';
import { GetBalanceSchema } from '@/validations/wallet.validation';
import { Router } from 'express';

const router = Router();
const walletController = new WalletController();

router.get(
  '/balance',
  authMiddleware,
  validateData(GetBalanceSchema, 'query'),
  catchAsyncError(walletController.getBalance),
);

export { router as walletRoutes };

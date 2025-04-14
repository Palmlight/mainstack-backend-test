import WalletController from '@/controllers/wallet.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import catchAsyncError from '@/middlewares/catch-async-error';
import { validateData } from '@/middlewares/zod.middleware';
import {
  DepositSchema,
  GetBalanceSchema,
  TransactionFilterSchema,
  TransferSchema,
} from '@/validations/wallet.validation';
import { Router } from 'express';

const router = Router();
const walletController = new WalletController();

router.get('/', authMiddleware, catchAsyncError(walletController.getWallets));

router.get(
  '/balance',
  authMiddleware,
  validateData(GetBalanceSchema, 'query'),
  catchAsyncError(walletController.getBalance),
);

router.post(
  '/deposit',
  validateData(DepositSchema),
  authMiddleware,
  catchAsyncError(walletController.deposit),
);

router.post(
  '/withdraw',
  validateData(DepositSchema),
  authMiddleware,
  catchAsyncError(walletController.withdraw),
);

router.post(
  '/transfer',
  validateData(TransferSchema),
  authMiddleware,
  catchAsyncError(walletController.transfer),
);

router.get(
  '/transactions',
  validateData(TransactionFilterSchema, 'query'),
  authMiddleware,
  catchAsyncError(walletController.getTransactions),
);

export { router as walletRoutes };

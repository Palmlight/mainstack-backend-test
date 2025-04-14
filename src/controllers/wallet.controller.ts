import { QueryParams } from '@/@types';
import { Currency, TransactionFilters } from '@/constants';
import { walletService } from '@/services/wallet.service';
import { createErrorObject, successfulResponse } from '@/utils/response.util';
import { DepositSchema, TransferSchema } from '@/validations/wallet.validation';
import { Request, Response } from 'express';
import { BAD_REQUEST } from 'http-status';

class WalletController {
  async getBalance(req: Request, res: Response) {
    const userId = String(req.user?.id);
    const { currency } = req.query as QueryParams;
    const balance = await walletService.getBalance(userId, currency!);

    return successfulResponse({
      message: 'Balance fetched successfully',
      data: balance,
      res,
    });
  }

  async getWallets(req: Request, res: Response) {
    const userId = String(req.user?.id);
    const wallets = await walletService.getWallets(userId);

    return successfulResponse({
      message: 'Wallets fetched successfully',
      data: wallets,
      res,
    });
  }

  async deposit(req: Request, res: Response) {
    const userId = String(req.user?.id);
    const { amount, currency } = req.body as DepositSchema;
    const deposit = await walletService.deposit(
      userId,
      amount,
      currency as Currency,
    );

    return successfulResponse({
      message: 'Deposit successful',
      data: deposit,
      res,
    });
  }

  async withdraw(req: Request, res: Response) {
    const userId = String(req.user?.id);
    const { amount, currency } = req.body as DepositSchema;
    const withdraw = await walletService.withdraw(
      userId,
      amount,
      currency as Currency,
    );

    return successfulResponse({
      message: 'Withdrawal successful',
      data: withdraw,
      res,
    });
  }

  async transfer(req: Request, res: Response) {
    const userId = String(req.user?.id);
    const username = String(req.user?.username);
    const {
      amount,
      currency,
      username: recipientUsername,
    } = req.body as TransferSchema;

    if (username === recipientUsername) {
      throw createErrorObject('Invalid transfer', BAD_REQUEST);
    }

    const transfer = await walletService.transferFunds({
      amount,
      currency: currency as Currency,
      recipientUsername,
      userId,
      username,
    });

    return successfulResponse({
      message: 'Transfer successful',
      data: transfer,
      res,
    });
  }

  async getTransactions(req: Request, res: Response) {
    const userId = String(req.user?.id);
    const transactions = await walletService.getTransactionHistory(
      userId,
      req.query as unknown as TransactionFilters,
    );

    return successfulResponse({
      message: 'Transactions fetched successfully',
      data: transactions,
      res,
    });
  }
}

export default WalletController;

import { QueryParams } from '@/@types';
import { Currency } from '@/constants';
import { walletService } from '@/services/wallet.service';
import { successfulResponse } from '@/utils/response.util';
import { DepositSchema } from '@/validations/wallet.validation';
import { Request, Response } from 'express';

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
}

export default WalletController;

import { QueryParams } from '@/@types';
import { walletService } from '@/services/wallet.service';
import { successfulResponse } from '@/utils/response.util';
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
}

export default WalletController;

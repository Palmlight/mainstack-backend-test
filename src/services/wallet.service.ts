import { Currency } from '@/constants';
import { IWallet } from '@/models/Wallet.model';
import TransactionLogRepo from '@/repositories/transactionLog.repo';
import WalletRepo from '@/repositories/wallet.repo';
import { createErrorObject } from '@/utils/response.util';
import { BAD_REQUEST } from 'http-status';

class WalletService {
  private walletRepo: WalletRepo;
  private transactionLogRepo: TransactionLogRepo;

  constructor() {
    this.walletRepo = new WalletRepo();
    this.transactionLogRepo = new TransactionLogRepo();
  }

  async getBalance(userId: string, currency: Currency) {
    const balance = await this.walletRepo.findOne({
      user: userId,
      currency,
    });

    return { ...balance };
  }

  async getWallets(userId: string) {
    const wallets = await this.walletRepo.find(
      {
        user: userId,
      },
      {},
    );

    if (!wallets) {
      throw createErrorObject('Wallets not found', BAD_REQUEST);
    }

    return wallets;
  }

  async deposit(userId: string, amount: number, currency: Currency) {
    const wallet = await this.walletRepo.findOne({
      user: userId,
      currency,
    });

    if (!wallet) {
      throw createErrorObject('Wallet not found', BAD_REQUEST);
    }

    // const session = await
  }
}

const walletService = new WalletService();

export { walletService };

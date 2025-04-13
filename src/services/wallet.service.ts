import { Currency } from '@/constants';
import WalletRepo from '@/repositories/wallet.repo';

class WalletService {
  private walletRepo: WalletRepo;

  constructor() {
    this.walletRepo = new WalletRepo();
  }

  async getBalance(userId: string, currency: Currency) {
    const balance = await this.walletRepo.findOne({
      user: userId,
      currency,
    });

    return { ...balance };
  }
}

const walletService = new WalletService();

export { walletService };

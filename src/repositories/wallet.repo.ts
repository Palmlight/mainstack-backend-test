import { IWallet, WalletModel } from '@/models/Wallet.model';
import BaseRepo from './base.repo';

class WalletRepo extends BaseRepo<IWallet> {
  constructor() {
    super(WalletModel);
  }
}

export default WalletRepo;

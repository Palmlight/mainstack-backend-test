import { Currency, TransactionStatus, TransactionTypes } from '@/constants';
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

    const depositLog = await this.transactionLogRepo.insertOne({
      wallet: wallet._id,
      user: userId,
      type: TransactionTypes.CREDIT,
      status: TransactionStatus.PENDING,
      currency,
      amount,
    });

    const session = await this.walletRepo.sessionStart();
    session.startTransaction();

    try {
      wallet.balance += amount;
      await this.walletRepo.updateOne(
        {
          _id: wallet._id,
        },
        {
          balance: wallet.balance,
        },
        session,
      );

      const updatedLog = await this.transactionLogRepo.findOneAndUpdate({
        findQuery: {
          _id: depositLog._id,
        },
        updateQuery: {
          status: TransactionStatus.SUCCESS,
        },
        session: session,
      });

      await session.commitTransaction();
      session.endSession();
      return updatedLog;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      const updatedLog = await this.transactionLogRepo.findOneAndUpdate({
        findQuery: { _id: depositLog._id },
        updateQuery: {
          status: TransactionStatus.FAILED,
          errorMessage: 'Unable to complete deposit',
        },
      });

      throw createErrorObject(
        'Unable to complete deposit',
        BAD_REQUEST,
        updatedLog,
      );
    }
  }

  async withdraw(userId: string, amount: number, currency: Currency) {
    const wallet = await this.walletRepo.findOne({
      user: userId,
      currency,
    });

    if (!wallet) {
      throw createErrorObject('Wallet not found', BAD_REQUEST);
    }

    if (wallet.balance < amount) {
      throw createErrorObject('Insufficient funds', BAD_REQUEST);
    }

    const withdrawLog = await this.transactionLogRepo.insertOne({
      wallet: wallet._id,
      user: userId,
      type: TransactionTypes.DEBIT,
      status: TransactionStatus.PENDING,
      currency,
      amount,
    });

    const session = await this.walletRepo.sessionStart();
    session.startTransaction();

    try {
      wallet.balance -= amount;
      await this.walletRepo.updateOne(
        { _id: wallet._id },
        {
          balance: wallet.balance,
        },
        session,
      );

      const updatedLog = await this.transactionLogRepo.findOneAndUpdate({
        findQuery: {
          _id: withdrawLog._id,
        },
        updateQuery: {
          status: TransactionStatus.SUCCESS,
        },
        session,
      });
      await session.commitTransaction();
      session.endSession();
      return updatedLog;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      const updatedLog = await this.transactionLogRepo.findOneAndUpdate({
        findQuery: { _id: withdrawLog._id },
        updateQuery: {
          status: TransactionStatus.FAILED,
          errorMessage: 'Unable to complete withdrawal',
        },
      });

      throw createErrorObject(
        'Unable to complete withdrawal',
        BAD_REQUEST,
        updatedLog,
      );
    }
  }
}

const walletService = new WalletService();

export { walletService };

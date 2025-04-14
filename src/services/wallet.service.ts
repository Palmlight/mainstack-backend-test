import {
  Currency,
  TransactionFilters,
  TransactionStatus,
  TransactionTypes,
} from '@/constants';
import TransactionLogRepo from '@/repositories/transactionLog.repo';
import UserRepo from '@/repositories/user.repo';
import WalletRepo from '@/repositories/wallet.repo';
import { anyObject, createErrorObject } from '@/utils/response.util';
import { BAD_REQUEST, NOT_FOUND } from 'http-status';

class WalletService {
  private userRepo: UserRepo;
  private walletRepo: WalletRepo;
  private transactionLogRepo: TransactionLogRepo;

  constructor() {
    this.userRepo = new UserRepo();
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
      throw createErrorObject('Wallets not found', NOT_FOUND);
    }

    return wallets;
  }

  async deposit(userId: string, amount: number, currency: Currency) {
    const wallet = await this.walletRepo.findOne({
      user: userId,
      currency,
    });

    if (!wallet) {
      throw createErrorObject('Wallet not found', NOT_FOUND);
    }

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

      const depositLog = await this.transactionLogRepo.insertOne(
        {
          wallet: wallet._id,
          user: userId,
          type: TransactionTypes.CREDIT,
          status: TransactionStatus.SUCCESS,
          currency,
          amount,
        },
        session,
      );

      await session.commitTransaction();
      session.endSession();
      return depositLog;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      throw createErrorObject('Unable to complete deposit', BAD_REQUEST);
    }
  }

  async withdraw(userId: string, amount: number, currency: Currency) {
    const wallet = await this.walletRepo.findOne({
      user: userId,
      currency,
    });

    if (!wallet) {
      throw createErrorObject('Wallet not found', NOT_FOUND);
    }

    if (wallet.balance < amount) {
      throw createErrorObject('Insufficient funds', BAD_REQUEST);
    }

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

      const withdrawLog = await this.transactionLogRepo.insertOne(
        {
          wallet: wallet._id,
          user: userId,
          type: TransactionTypes.DEBIT,
          status: TransactionStatus.SUCCESS,
          currency,
          amount,
        },
        session,
      );
      await session.commitTransaction();
      session.endSession();
      return withdrawLog;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      throw createErrorObject(
        'Unable to process withdrawal request',
        BAD_REQUEST,
      );
    }
  }

  async transferFunds({
    userId,
    username,
    recipientUsername,
    amount,
    currency,
  }: {
    userId: string;
    username: string;
    recipientUsername: string;
    amount: number;
    currency: Currency;
  }) {
    const recipient = await this.userRepo.findOne({
      username: recipientUsername,
    });

    if (!recipient) {
      throw createErrorObject('Recipient not found', NOT_FOUND);
    }

    const recipientWallet = await this.walletRepo.findOne({
      user: recipient._id,
      currency,
    });

    if (!recipientWallet) {
      throw createErrorObject('Recipient wallet not found', NOT_FOUND);
    }

    const senderWallet = await this.walletRepo.findOne({
      user: userId,
      currency,
    });

    if (!senderWallet) {
      throw createErrorObject('Wallet not found', NOT_FOUND);
    }

    if (senderWallet.balance < amount) {
      throw createErrorObject('Insufficient funds', BAD_REQUEST);
    }

    const session = await this.walletRepo.sessionStart();
    session.startTransaction();

    try {
      senderWallet.balance -= amount;
      recipientWallet.balance += amount;
      await this.walletRepo.updateOne(
        { _id: senderWallet._id },
        {
          balance: senderWallet.balance,
        },
        session,
      );
      await this.walletRepo.updateOne(
        { _id: recipientWallet._id },
        {
          balance: recipientWallet.balance,
        },
        session,
      );

      const transferLog = await this.transactionLogRepo.insertOne({
        wallet: senderWallet._id,
        user: userId,
        type: TransactionTypes.DEBIT,
        status: TransactionStatus.SUCCESS,
        currency,
        amount,
        meta: {
          recipientUsername: recipient.username,
          recipientWallet: recipientWallet._id,
        },
      });

      await this.transactionLogRepo.insertOne(
        {
          wallet: recipientWallet._id,
          user: recipient._id,
          type: TransactionTypes.CREDIT,
          status: TransactionStatus.SUCCESS,
          currency,
          amount,
          meta: {
            senderUsername: username,
            senderWallet: senderWallet._id,
          },
        },
        session,
      );

      await session.commitTransaction();
      session.endSession();
      return transferLog;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      throw createErrorObject('Unable to complete transfer', BAD_REQUEST);
    }
  }

  async getTransactionHistory(
    userId: string,
    filters: TransactionFilters = {},
  ) {
    const query: anyObject = {
      user: userId,
      ...filters,
    };

    const transactions = await this.transactionLogRepo.find(query, {});

    if (!transactions || transactions.length === 0) {
      throw createErrorObject('No transactions found', NOT_FOUND);
    }

    return transactions;
  }
}

const walletService = new WalletService();

export { walletService };

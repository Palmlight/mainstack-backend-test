import { walletService } from './wallet.service';
import WalletRepo from '../repositories/wallet.repo';
import UserRepo from '../repositories/user.repo';
import TransactionLogRepo from '../repositories/transactionLog.repo';
import { Currency, TransactionFilters } from '../constants';
import { createErrorObject } from '../utils/response.util';

jest.mock('@/repositories/wallet.repo');
jest.mock('@/repositories/user.repo');
jest.mock('@/repositories/transactionLog.repo');
jest.mock('@/utils/response.util');

describe('WalletService', () => {
  const userId = 'user-123';
  const recipientId = 'user-456';
  const username = 'alice';
  const recipientUsername = 'bob';
  const walletId = 'wallet-123';
  const recipientWalletId = 'wallet-456';
  const currency = Currency.USD;

  const wallet = { _id: walletId, user: userId, currency, balance: 100 };
  const recipientWallet = {
    _id: recipientWalletId,
    user: recipientId,
    currency,
    balance: 50,
  };

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      (WalletRepo.prototype.findOne as jest.Mock).mockResolvedValue(wallet);

      const result = await walletService.getBalance(userId, currency);
      expect(result).toEqual(wallet);
    });
  });

  describe('getWallets', () => {
    it('should return all wallets for a user', async () => {
      (WalletRepo.prototype.find as jest.Mock).mockResolvedValue([wallet]);

      const result = await walletService.getWallets(userId);
      expect(result).toEqual([wallet]);
    });

    it('should throw if no wallets found', async () => {
      (WalletRepo.prototype.find as jest.Mock).mockResolvedValue(null);
      (createErrorObject as jest.Mock).mockImplementation(() => {
        const err = new Error('Wallets not found');
        (err as any).statusCode = 404;
        return err;
      });

      await expect(walletService.getWallets(userId)).rejects.toThrow(
        'Wallets not found',
      );
    });
  });

  describe('deposit', () => {
    it('should deposit amount and log transaction', async () => {
      (WalletRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        ...wallet,
      });
      (WalletRepo.prototype.sessionStart as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (WalletRepo.prototype.updateOne as jest.Mock).mockResolvedValue({});
      (TransactionLogRepo.prototype.insertOne as jest.Mock).mockResolvedValue({
        _id: 'log-123',
      });

      const result = await walletService.deposit(userId, 50, currency);

      expect(result).toEqual({ _id: 'log-123' });
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should throw if wallet not found', async () => {
      (WalletRepo.prototype.findOne as jest.Mock).mockResolvedValue(null);
      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        if (msg === 'Insufficient funds') {
          const err = new Error('Insufficient funds');
          (err as any).statusCode = code;
          return err;
        }
        const err = new Error(msg);
        (err as any).statusCode = code;
        return err;
      });

      await expect(walletService.deposit(userId, 50, currency)).rejects.toThrow(
        'Wallet not found',
      );
    });
  });

  describe('withdraw', () => {
    it('should withdraw amount and log transaction', async () => {
      (WalletRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        ...wallet,
      });
      (WalletRepo.prototype.sessionStart as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (WalletRepo.prototype.updateOne as jest.Mock).mockResolvedValue({});
      (TransactionLogRepo.prototype.insertOne as jest.Mock).mockResolvedValue({
        _id: 'log-456',
      });

      const result = await walletService.withdraw(userId, 50, currency);

      expect(result).toEqual({ _id: 'log-456' });
    });

    it('should throw if insufficient funds', async () => {
      (WalletRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        ...wallet,
        balance: 10,
      });
      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        if (msg === 'Wallet not found') {
          const err = new Error('Wallet not found');
          (err as any).statusCode = code;
          return err;
        }
        const err = new Error(msg);
        (err as any).statusCode = code;
        return err;
      });

      await expect(
        walletService.withdraw(userId, 100, currency),
      ).rejects.toThrow('Insufficient funds');
    });
  });

  describe('transferFunds', () => {
    it('should transfer funds between users and log transactions', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        _id: recipientId,
        username: recipientUsername,
      });
      (WalletRepo.prototype.findOne as jest.Mock)
        .mockResolvedValueOnce({ ...recipientWallet })
        .mockResolvedValueOnce({ ...wallet });

      (WalletRepo.prototype.sessionStart as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (WalletRepo.prototype.updateOne as jest.Mock).mockResolvedValue({});
      (TransactionLogRepo.prototype.insertOne as jest.Mock).mockResolvedValue({
        _id: 'transfer-log',
      });

      const result = await walletService.transferFunds({
        userId,
        username,
        recipientUsername,
        amount: 30,
        currency,
      });

      expect(result).toEqual({ _id: 'transfer-log' });
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should throw if recipient not found', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue(null);
      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        if (msg === 'Wallet not found') {
          const err = new Error('Wallet not found');
          (err as any).statusCode = code;
          return err;
        }
        const err = new Error(msg);
        (err as any).statusCode = code;
        return err;
      });

      await expect(
        walletService.transferFunds({
          userId,
          username,
          recipientUsername,
          amount: 30,
          currency,
        }),
      ).rejects.toThrow('Recipient not found');
    });

    it('should throw if sender has insufficient balance', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        _id: recipientId,
      });
      (WalletRepo.prototype.findOne as jest.Mock)
        .mockResolvedValueOnce({ ...recipientWallet })
        .mockResolvedValueOnce({ ...wallet, balance: 10 });

      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        const err = new Error(msg);
        (err as any).statusCode = code;
        return err;
      });

      await expect(
        walletService.transferFunds({
          userId,
          username,
          recipientUsername,
          amount: 50,
          currency,
        }),
      ).rejects.toThrow('Insufficient funds');
    });
  });
  describe('deposit', () => {
    it('should throw an error if unable to complete deposit', async () => {
      (WalletRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        _id: walletId,
        balance: 100,
        currency,
      });
      (WalletRepo.prototype.sessionStart as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (WalletRepo.prototype.updateOne as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(walletService.deposit(userId, 50, currency)).rejects.toThrow(
        'Unable to complete deposit',
      );
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('withdraw', () => {
    it('should throw an error if unable to process withdrawal request', async () => {
      (WalletRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        _id: walletId,
        balance: 100,
        currency,
      });
      (WalletRepo.prototype.sessionStart as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (WalletRepo.prototype.updateOne as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        walletService.withdraw(userId, 50, currency),
      ).rejects.toThrow('Unable to process withdrawal request');
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('transferFunds', () => {
    it('should throw an error if unable to complete transfer', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        _id: recipientId,
        username: recipientUsername,
      });
      (WalletRepo.prototype.findOne as jest.Mock)
        .mockResolvedValueOnce({ ...wallet })
        .mockResolvedValueOnce({ ...recipientWallet });
      (WalletRepo.prototype.sessionStart as jest.Mock).mockResolvedValue(
        mockSession,
      );
      (WalletRepo.prototype.updateOne as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        walletService.transferFunds({
          userId,
          username,
          recipientUsername,
          amount: 50,
          currency,
        }),
      ).rejects.toThrow('Unable to complete transfer');
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });
  describe('transferFunds', () => {
    it('should throw an error if recipient wallet is not found', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        _id: recipientId,
        username: recipientUsername,
      });
      (WalletRepo.prototype.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...wallet });

      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        const err = new Error(msg);
        (err as any).statusCode = code;
        return err;
      });

      await expect(
        walletService.transferFunds({
          userId,
          username,
          recipientUsername,
          amount: 50,
          currency,
        }),
      ).rejects.toThrow('Recipient wallet not found');
    });

    it('should throw an error if sender wallet is not found', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        _id: recipientId,
        username: recipientUsername,
      });
      (WalletRepo.prototype.findOne as jest.Mock)
        .mockResolvedValueOnce({ ...recipientWallet })
        .mockResolvedValueOnce(null);

      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        const err = new Error('Wallet not found');
        (err as any).statusCode = code;
        return err;
      });

      await expect(
        walletService.transferFunds({
          userId,
          username,
          recipientUsername,
          amount: 50,
          currency,
        }),
      ).rejects.toThrow('Wallet not found');
    });

    it('should throw an error if sender has insufficient funds', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue({
        _id: recipientId,
        username: recipientUsername,
      });
      (WalletRepo.prototype.findOne as jest.Mock)
        .mockResolvedValueOnce({ ...recipientWallet })
        .mockResolvedValueOnce({ ...wallet, balance: 10 });

      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        const err = new Error('Insufficient funds');
        (err as any).statusCode = code;
        return err;
      });

      await expect(
        walletService.transferFunds({
          userId,
          username,
          recipientUsername,
          amount: 50,
          currency,
        }),
      ).rejects.toThrow('Insufficient funds');
    });
  });

  describe('getTransactionHistory', () => {
    const mockTransactionLogRepo = walletService['transactionLogRepo'];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return transactions when found', async () => {
      const userId = 'user-123';
      const filters = { currency: 'USD' } as unknown as TransactionFilters;
      const mockTransactions = [
        { id: 'txn-1', amount: 100, currency: 'USD' },
        { id: 'txn-2', amount: 200, currency: 'USD' },
      ];

      mockTransactionLogRepo.find = jest
        .fn()
        .mockResolvedValue(mockTransactions);

      const result = await walletService.getTransactionHistory(userId, filters);

      expect(mockTransactionLogRepo.find).toHaveBeenCalledWith(
        { user: userId, ...filters },
        {},
      );
      expect(result).toEqual(mockTransactions);
    });

    it('should throw an error if no transactions are found', async () => {
      const userId = 'user-123';
      const filters = { currency: 'USD' } as unknown as TransactionFilters;

      mockTransactionLogRepo.find = jest.fn().mockResolvedValue([]);

      (createErrorObject as jest.Mock).mockImplementation(
        (message, statusCode) => {
          const error = new Error(message) as any;
          error.statusCode = statusCode;
          throw error;
        },
      );

      await expect(
        walletService.getTransactionHistory(userId, filters),
      ).rejects.toThrow('No transactions found');

      expect(mockTransactionLogRepo.find).toHaveBeenCalledWith(
        { user: userId, ...filters },
        {},
      );
    });
  });
});

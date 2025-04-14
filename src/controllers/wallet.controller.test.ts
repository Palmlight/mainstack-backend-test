import WalletController from './wallet.controller';
import { walletService } from '../services/wallet.service';
import { successfulResponse, createErrorObject } from '../utils/response.util';
import { BAD_REQUEST } from 'http-status';
import { Currency } from '../constants';

jest.mock('@/services/wallet.service');
jest.mock('@/utils/response.util');

(createErrorObject as jest.Mock).mockImplementation((message, statusCode) => {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  throw error;
});

describe('WalletController', () => {
  const controller = new WalletController();

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return wallet balance successfully', async () => {
      const req = {
        user: { id: 'user-123' },
        query: { currency: Currency.USD },
      } as any;

      const mockBalance = { balance: 500, currency: Currency.USD };
      (walletService.getBalance as jest.Mock).mockResolvedValue(mockBalance);

      await controller.getBalance(req, mockRes);

      expect(walletService.getBalance).toHaveBeenCalledWith(
        'user-123',
        Currency.USD,
      );
      expect(successfulResponse).toHaveBeenCalledWith({
        message: 'Balance fetched successfully',
        data: mockBalance,
        res: mockRes,
      });
    });
  });

  describe('getWallets', () => {
    it('should return user wallets successfully', async () => {
      const req = { user: { id: 'user-123' } } as any;
      const mockWallets = [{ currency: Currency.USD, balance: 100 }];

      (walletService.getWallets as jest.Mock).mockResolvedValue(mockWallets);

      await controller.getWallets(req, mockRes);

      expect(walletService.getWallets).toHaveBeenCalledWith('user-123');
      expect(successfulResponse).toHaveBeenCalledWith({
        message: 'Wallets fetched successfully',
        data: mockWallets,
        res: mockRes,
      });
    });
  });

  describe('deposit', () => {
    it('should deposit funds successfully', async () => {
      const req = {
        user: { id: 'user-123' },
        body: { amount: 100, currency: Currency.USD },
      } as any;

      const mockDeposit = { amount: 100, currency: Currency.USD };
      (walletService.deposit as jest.Mock).mockResolvedValue(mockDeposit);

      await controller.deposit(req, mockRes);

      expect(walletService.deposit).toHaveBeenCalledWith(
        'user-123',
        100,
        Currency.USD,
      );
      expect(successfulResponse).toHaveBeenCalledWith({
        message: 'Deposit successful',
        data: mockDeposit,
        res: mockRes,
      });
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds successfully', async () => {
      const req = {
        user: { id: 'user-123' },
        body: { amount: 50, currency: Currency.USD },
      } as any;

      const mockWithdraw = { amount: 50, currency: Currency.USD };
      (walletService.withdraw as jest.Mock).mockResolvedValue(mockWithdraw);

      await controller.withdraw(req, mockRes);

      expect(walletService.withdraw).toHaveBeenCalledWith(
        'user-123',
        50,
        Currency.USD,
      );
      expect(successfulResponse).toHaveBeenCalledWith({
        message: 'Withdrawal successful',
        data: mockWithdraw,
        res: mockRes,
      });
    });
  });

  describe('transfer', () => {
    it('should throw an error for self-transfer', async () => {
      const req = {
        user: { id: 'user-123', username: 'john' },
        body: {
          amount: 50,
          currency: 'USD',
          username: 'john',
        },
      } as any;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as any;

      await expect(controller.transfer(req, mockRes)).rejects.toThrow(
        'Invalid transfer',
      );

      expect(walletService.transferFunds).not.toHaveBeenCalled();
    });

    it('should transfer funds successfully', async () => {
      const req = {
        user: { id: 'user-123', username: 'john' },
        body: {
          amount: 50,
          currency: Currency.USD,
          username: 'doe',
        },
      } as any;

      const mockTransfer = {
        amount: 50,
        currency: Currency.USD,
        to: 'doe',
      };

      (walletService.transferFunds as jest.Mock).mockResolvedValue(
        mockTransfer,
      );

      await controller.transfer(req, mockRes);

      expect(walletService.transferFunds).toHaveBeenCalledWith({
        amount: 50,
        currency: Currency.USD,
        recipientUsername: 'doe',
        userId: 'user-123',
        username: 'john',
      });

      expect(successfulResponse).toHaveBeenCalledWith({
        message: 'Transfer successful',
        data: mockTransfer,
        res: mockRes,
      });
    });
  });
});

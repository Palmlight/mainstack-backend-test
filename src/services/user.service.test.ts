import { userService } from './user.service';
import UserRepo from '../repositories/user.repo';
import WalletRepo from '../repositories/wallet.repo';
import { hashValue, comparePassword } from '../utils/hash.util';
import { generateJWTToken } from '../utils/jwt.util';
import { Currency } from '../constants';
import { createErrorObject } from '../utils/response.util';

jest.mock('@/repositories/user.repo');
jest.mock('@/repositories/wallet.repo');
jest.mock('@/utils/hash.util');
jest.mock('@/utils/jwt.util');
jest.mock('@/utils/response.util');

describe('UserService', () => {
  const mockUserId = 'mock-user-id';
  const mockUser = {
    _id: mockUserId,
    username: 'testuser',
    fullName: 'Test User',
    password: 'hashed-password',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and create wallets', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue(null);
      (hashValue as jest.Mock).mockResolvedValue('hashed-password');
      (UserRepo.prototype.insertOne as jest.Mock).mockResolvedValue(mockUser);
      (WalletRepo.prototype.insertOne as jest.Mock).mockResolvedValue({});
      (generateJWTToken as jest.Mock).mockResolvedValue('mock-jwt');

      const result = await userService.register({
        username: 'testuser',
        fullName: 'Test User',
        password: '123456',
      });

      expect(result).toEqual({
        user: {
          _id: mockUser._id,
          username: mockUser.username,
          fullName: mockUser.fullName,
        },
        token: 'mock-jwt',
      });

      expect(UserRepo.prototype.insertOne).toHaveBeenCalled();
      expect(WalletRepo.prototype.insertOne).toHaveBeenCalledTimes(
        Object.keys(Currency).length,
      );
    });

    it('should throw if user already exists', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue(mockUser);
      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        const err = new Error(msg);
        (err as any).statusCode = code;
        return err;
      });

      await expect(
        userService.register({
          username: 'testuser',
          fullName: 'Test User',
          password: '123456',
        }),
      ).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (generateJWTToken as jest.Mock).mockResolvedValue('mock-jwt');

      const result = await userService.login({
        username: 'testuser',
        password: '123456',
      });

      expect(result).toEqual({
        user: {
          _id: mockUser._id,
          username: mockUser.username,
          fullName: mockUser.fullName,
        },
        token: 'mock-jwt',
      });
    });

    it('should throw if user is not found', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue(null);
      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        const err = new Error(msg);
        (err as any).statusCode = code;
        return err;
      });

      await expect(
        userService.login({
          username: 'wronguser',
          password: '123456',
        }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw if password is invalid', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue(mockUser);
      (comparePassword as jest.Mock).mockResolvedValue(false);
      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        const err = new Error(msg);
        (err as any).statusCode = code;
        return err;
      });

      await expect(
        userService.login({
          username: 'testuser',
          password: 'wrongpass',
        }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getUserById', () => {
    it('should return user data by ID', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById(mockUserId);

      expect(result).toEqual({
        user: {
          _id: mockUser._id,
          username: mockUser.username,
          fullName: mockUser.fullName,
        },
      });
    });

    it('should throw if user is not found', async () => {
      (UserRepo.prototype.findOne as jest.Mock).mockResolvedValue(null);
      (createErrorObject as jest.Mock).mockImplementation((msg, code) => {
        const err = new Error(msg);
        (err as any).statusCode = code;
        return err;
      });

      await expect(userService.getUserById('unknown-id')).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('changePassword', () => {
    it('should update user password', async () => {
      (hashValue as jest.Mock).mockResolvedValue('new-hashed-password');
      (UserRepo.prototype.updateOne as jest.Mock).mockResolvedValue({
        modifiedCount: 1,
      });

      await userService.changePassword({ password: 'newpass123' }, mockUserId);

      expect(UserRepo.prototype.updateOne).toHaveBeenCalledWith(
        { _id: mockUserId },
        { password: 'new-hashed-password' },
      );
    });
  });
});

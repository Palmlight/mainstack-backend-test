import UserController from './user.controller';
import { userService } from '../services/user.service';
import { CREATED, OK } from 'http-status';
import { successfulResponse } from '../utils/response.util';

jest.mock('@/services/user.service');
jest.mock('@/utils/response.util');

describe('UserController', () => {
  const controller = new UserController();

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user and return a successful response', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'password',
          fullName: 'Test User',
        },
      } as any;

      const userData = {
        user: { username: 'testuser', _id: 'user-1', fullName: 'Test User' },
        token: 'token-123',
      };

      (userService.register as jest.Mock).mockResolvedValue(userData);

      await controller.register(req, mockRes);

      expect(userService.register).toHaveBeenCalledWith(req.body);
      expect(successfulResponse).toHaveBeenCalledWith({
        message: 'User registered successfully',
        data: userData,
        res: mockRes,
        statusCode: CREATED,
      });
    });
  });

  describe('login', () => {
    it('should log in a user and return a successful response', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'password',
        },
      } as any;

      const loginData = {
        user: { username: 'testuser', _id: 'user-1', fullName: 'Test User' },
        token: 'token-abc',
      };

      (userService.login as jest.Mock).mockResolvedValue(loginData);

      await controller.login(req, mockRes);

      expect(userService.login).toHaveBeenCalledWith(req.body);
      expect(successfulResponse).toHaveBeenCalledWith({
        message: 'User logged in successfully',
        data: loginData,
        res: mockRes,
        statusCode: OK,
      });
    });
  });

  describe('changePassword', () => {
    it('should change the password and return a success message', async () => {
      const req = {
        body: { password: 'newPassword' },
        user: { id: 'user-1' },
      } as any;

      (userService.changePassword as jest.Mock).mockResolvedValue(undefined);

      await controller.changePassword(req, mockRes);

      expect(userService.changePassword).toHaveBeenCalledWith(
        req.body,
        'user-1',
      );
      expect(successfulResponse).toHaveBeenCalledWith({
        message: 'Password changed successfully',
        res: mockRes,
        statusCode: OK,
      });
    });
  });
});

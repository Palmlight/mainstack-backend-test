import { userService } from '@/services/user.service';
import { decodeJWTToken } from '@/utils/jwt.util';
import { errorResponse } from '@/utils/response.util';
import { NextFunction, Request, Response } from 'express';
import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from 'http-status';

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.headers['authorization']) {
      return errorResponse({
        res,
        message: 'Please login to continue',
        statusCode: UNAUTHORIZED,
      });
    }

    const authorization = req.headers?.authorization?.replace('Bearer ', '');

    if (!authorization) {
      return errorResponse({
        res,
        message: 'Please login to continue',
        statusCode: UNAUTHORIZED,
      });
    }
    const decoded = decodeJWTToken(authorization) as {
      id: string;
      username: string;
    };

    if (!decoded) {
      return errorResponse({
        res,
        message: 'Invalid token',
        statusCode: UNAUTHORIZED,
      });
    }

    const user = await userService.getUserById(decoded.id);

    if (!user) {
      return errorResponse({
        res,
        message: 'Invalid token',
        statusCode: UNAUTHORIZED,
      });
    }

    req.user = {
      ...user.user,
      id: String(user?.user?._id),
    };

    return next();
  } catch (error) {
    return errorResponse({
      res,
      message: 'Something went wrong',
      statusCode: INTERNAL_SERVER_ERROR,
    });
  }
};

export default authMiddleware;

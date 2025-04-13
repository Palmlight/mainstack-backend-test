import { CREATED, OK } from 'http-status';
import { successfulResponse } from '../utils/response.util';
import { userService } from '../services/user.service';
import { Request, Response } from 'express';

class UserController {
  async register(req: Request, res: Response) {
    const user = await userService.register(req.body);

    return successfulResponse({
      message: 'User registered successfully',
      data: user,
      res,
      statusCode: CREATED,
    });
  }

  async login(req: Request, res: Response) {
    const user = await userService.login(req.body);

    return successfulResponse({
      message: 'User logged in successfully',
      data: user,
      res,
      statusCode: OK,
    });
  }

  async changePassword(req: Request, res: Response) {
    const userId = String(req.user?.id);
    await userService.changePassword(req.body, userId);

    console.log(req);
    return successfulResponse({
      message: 'Password changed successfully',
      res,
      data: {
        // ...req?.user,
      },
      statusCode: OK,
    });
  }
}

export default UserController;

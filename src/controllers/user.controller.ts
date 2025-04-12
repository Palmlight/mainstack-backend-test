import { CREATED } from 'http-status';
import { successfulResponse } from '../utils/response.util';
import { userService } from '../services/user.service';

class UserController {
  async register(req: any, res: any) {
    const user = await userService.register(req.body);

    return successfulResponse({
      message: 'User registered successfully',
      data: user,
      res,
      statusCode: CREATED,
    });
  }
}

export default UserController;

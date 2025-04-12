import UserRepo from '../repositories/user.repo';
import { CreateUserSchema } from '../validations/user.validations';

class UserService {
  private userRepo: UserRepo;

  constructor() {
    this.userRepo = new UserRepo();
  }

  async register(data: CreateUserSchema) {
    return data;
  }
}

const userService = new UserService();

export { userService };

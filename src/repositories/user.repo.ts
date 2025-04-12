import { IUser, UserModel } from '../models/User.model';
import BaseRepo from './base.repo';

class UserRepo extends BaseRepo<IUser> {
  constructor() {
    super(UserModel);
  }
}

export default UserRepo;

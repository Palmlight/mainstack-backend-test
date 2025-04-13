import UserRepo from '@/repositories/user.repo';
import { comparePassword, hashValue } from '@/utils/hash.util';
import { generateJWTToken } from '@/utils/jwt.util';
import { createErrorObject } from '@/utils/response.util';
import {
  ChangePasswordSchema,
  CreateUserSchema,
  LoginSchema,
} from '@/validations/user.validations';
import { BAD_REQUEST, CONFLICT } from 'http-status';

class UserService {
  private userRepo: UserRepo;

  constructor() {
    this.userRepo = new UserRepo();
  }

  async register(data: CreateUserSchema) {
    const existingUser = await this.userRepo.findOne({
      username: data.username,
    });

    if (existingUser) {
      throw createErrorObject('User already exists', CONFLICT);
    }

    const password = await hashValue(data.password);

    const user = await this.userRepo.insertOne({
      ...data,
      password,
    });

    const token = await generateJWTToken({
      id: user._id,
      username: user.username,
    });

    return {
      user: {
        fullName: user.fullName,
        username: user.username,
        _id: user._id,
      },
      token,
    };
  }

  async login(data: LoginSchema) {
    const user = await this.userRepo.findOne(
      {
        username: data.username,
      },
      {
        projection: '+password',
      },
    );

    if (!user) {
      throw createErrorObject('Invalid credentials', BAD_REQUEST);
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw createErrorObject('Invalid credentials', BAD_REQUEST);
    }

    const token = await generateJWTToken({
      id: user._id,
      username: user.username,
    });

    return {
      user: {
        fullName: user.fullName,
        username: user.username,
        _id: user._id,
      },
      token,
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findOne({ _id: id });

    if (!user) {
      throw createErrorObject('User not found', BAD_REQUEST);
    }

    return {
      user: {
        fullName: user.fullName,
        username: user.username,
        _id: user._id,
      },
    };
  }

  async changePassword(data: ChangePasswordSchema, userId: string) {
    await this.userRepo.updateOne(
      { _id: userId },
      {
        password: await hashValue(data.password),
      },
    );
  }
}

const userService = new UserService();

export { userService };

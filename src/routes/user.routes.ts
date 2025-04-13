import { Router } from 'express';
import catchAsyncError from '@/middlewares/catch-async-error';
import UserController from '@/controllers/user.controller';
import { validateData } from '@/controllers/zod.middleware';
import {
  ChangePasswordSchema,
  CreateUserSchema,
  LoginSchema,
} from '@/validations/user.validations';
import authMiddleware from '@/middlewares/auth.middleware';

const router = Router();

const userController = new UserController();

router.post(
  '/register',
  validateData(CreateUserSchema),
  catchAsyncError(userController.register),
);

router.post(
  '/login',
  validateData(LoginSchema),
  catchAsyncError(userController.login),
);

router.post(
  '/change-password',
  validateData(ChangePasswordSchema),
  authMiddleware,
  catchAsyncError(userController.changePassword),
);

export { router as userRoutes };

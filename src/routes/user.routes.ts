import { Router } from 'express';
import catchAsyncError from '../middlewares/catch-async-error';
import UserController from '../controllers/user.controller';

const router = Router();

const userController = new UserController();

router.post('/', catchAsyncError(userController.register));

export { router as userRoutes };

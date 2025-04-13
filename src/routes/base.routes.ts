import { Application } from 'express';
import { userRoutes } from './user.routes';
import { appErrorHandler, unknownRouteHandler } from '../utils/response.util';
import { walletRoutes } from './wallet.routes';

export const loadRoutes = (app: Application) => {
  app.get('/', (req, res) => {
    res.send('Hello there!');
  });

  app.use('/user', userRoutes);
  app.use('/wallet', walletRoutes);

  app.use(unknownRouteHandler);
  app.use(appErrorHandler);
};

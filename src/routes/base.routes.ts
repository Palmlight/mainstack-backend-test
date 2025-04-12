import { Application } from 'express';
import { userRoutes } from './user.routes';
import { appErrorHandler, unknownRouteHandler } from '../utils/response.util';

export const loadRoutes = (app: Application) => {
  app.get('/', (req, res) => {
    res.send('Hello there!');
  });

  app.use('/user', userRoutes);

  app.use(unknownRouteHandler);

  app.use(appErrorHandler);
};

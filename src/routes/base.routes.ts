import { Application } from 'express';

export const loadRoutes = (app: Application) => {
  app.get('/', (req, res) => {
    res.send('Hello there!');
  });
};

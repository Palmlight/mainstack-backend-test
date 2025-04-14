import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import config from '@/config/config';
import { loadRoutes } from '@/routes/base.routes';

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(config.DB_URI)
  .then(() => {
    console.log('Connected to database successfully!');

    loadRoutes(app);

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Environment: ${config.enviroment}`);
      console.log('Server started successfully');
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

export default app;

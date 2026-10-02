import express, { Application } from 'express';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  // Standard middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API router
  app.use('/api', apiRouter);

  // Global central error handler
  app.use(errorHandler);

  return app;
}

export default createApp;

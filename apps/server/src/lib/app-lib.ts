import express from 'express';
import bodyParser from 'body-parser';
import { corsMiddleware, serverErrorMiddleware } from './express';
import { authRoutes, postsRoutes, usersRouter } from '../routes';

export const makeExpressApp = () => {
  const app = express();

  app.use(bodyParser.urlencoded());
  app.use(bodyParser.json());
  app.use(corsMiddleware());

  app.use('/auth', authRoutes);
  app.use('/users', usersRouter);
  app.use('/posts', postsRoutes);

  app.use(serverErrorMiddleware());

  return app;
};

import { Router } from 'express';
import { sessionRepository, userRepository } from '../database';
import { appLog, authMiddleware, expressPromise, getSession } from '../lib';
import { loginRequestSchema } from '@qa-assessment/shared';

const route = Router();

route.use('/logout', authMiddleware());

route.post(
  '/login',
  expressPromise(async (req, res) => {
    appLog('Login attempt');

    const body = loginRequestSchema.safeParse(req.body);

    if (!body.success) {
      appLog('Invalid login request', body.error.errors);
      return res.status(422).json({ errors: body.error.errors });
    }

    const user = await userRepository.findByCredentials(body.data);

    if (!user) {
      appLog('Unable to locate user with provided credentials');
      return res.status(422).json({ message: 'Invalid credentials' });
    }

    await sessionRepository
      .create(user)
      .then((session) => res.send(session))
      .then(() => appLog('User logged in', user));
  }),
);

route.post(
  '/logout',
  expressPromise(async (req, res) => {
    appLog('Logout attempt');
    const session = await getSession(req);

    await sessionRepository
      .delete(session.id)
      .then(() => res.send({ message: 'Logged out' }))
      .then(() => appLog('User logged out', session));
  }),
);

export const authRoutes = route;

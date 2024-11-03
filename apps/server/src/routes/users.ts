import { Router } from 'express';
import { sessionRepository, userRepository } from '../database';
import {
  userRegisterRequestSchema,
  userUpdateRequestSchema,
} from '@qa-assessment/shared';
import { appLog, expressPromise } from '../lib';

const router = Router();

router.get(
  '/:userId',
  expressPromise(async (req, res) => {
    try {
      const user = await userRepository.find(req.params.userId);
      res.json({
        ...user,
        favoriteBook: user.favoriteBook
          ? JSON.parse(user.favoriteBook)
          : undefined,
      });
    } catch (error) {
      res.status(404).json({ message: 'User not found' });
    }
  }),
);

router.put(
  '/:userId',
  expressPromise(async (req, res) => {
    const user = await userRepository.find(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const body = userUpdateRequestSchema.safeParse(req.body);

    if (!body.success) {
      return res.status(422).json({ errors: body.error.errors });
    }

    await userRepository
      .update(req.params.userId, {
        ...user,
        ...body.data,
        favoriteBook: body.data.favoriteBook
          ? JSON.stringify(body.data.favoriteBook)
          : undefined,
      })
      .then((user) => res.json(user));
  }),
);

router.post(
  '/',
  expressPromise(async (req, res) => {
    appLog('Register attempt');
    const body = userRegisterRequestSchema.safeParse(req.body);

    if (!body.success) {
      appLog('Invalid register request', body.error.errors);
      return res.status(422).json({ errors: body.error.errors });
    }

    await userRepository
      .register(body.data)
      .then((user) => sessionRepository.create(user))
      .then((session) => res.json(session))
      .then(() => appLog('User registered', body.data))
      .then(() => appLog('User logged in', body.data));
  }),
);

export const usersRouter = router;

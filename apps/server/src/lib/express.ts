import { ExpressErrorMiddleware, ExpressMiddleware } from './types';
import { sessionRepository } from '../database';

import { Request, Response } from 'express';
import { Session } from '@qa-assessment/shared';

export const authMiddleware = (): ExpressMiddleware => {
  return (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization || !sessionRepository.findByToken(authorization)) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    getSession(req)
      .then(() => next())
      .catch(() => res.status(401).json({ message: 'Unauthorized' }));
  };
};

export function corsMiddleware(): ExpressMiddleware {
  return (req, res, next) => {
    const origin = req.get('origin');

    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  };
}

export function serverErrorMiddleware(): ExpressErrorMiddleware {
  return (err, _req, res, _next) => {
    res.status(500).json({ message: 'Internal server error' });
  };
}

export const getSession = async (req: Request) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new Error('Unauthorized');
  }

  const session = await sessionRepository.findByToken(authorization);

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session as Session;
};

/**
 * Wrap your Express async handlers with this to ensure
 * the error handler can catch unhandled promise rejections.
 * @param fn
 */
export const expressPromise =
  <T extends (req: Request, res: Response, next: () => unknown) => unknown>(
    fn: T,
  ) =>
  (req: Request, res: Response, next: () => unknown) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

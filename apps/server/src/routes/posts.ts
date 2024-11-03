import { Router } from 'express';
import { postRepository } from '../database';
import { authMiddleware, expressPromise, getSession } from '../lib';
import { createPostSchema, updatePostSchema } from '@qa-assessment/shared';

const router = Router();

router.use(authMiddleware());

router.get(
  '/',
  expressPromise(async (_req, res) =>
    postRepository.all().then((posts) => res.json(posts)),
  ),
);

router.get(
  '/:postId',
  expressPromise(async (req, res) =>
    postRepository
      .find(req.params.postId)
      .then((post) => res.json(post))
      .catch((e) => {
        console.error(e);
        res.status(404).json({ message: 'Post not found' });
      }),
  ),
);

router.post(
  '/',
  expressPromise(async (req, res) => {
    const body = createPostSchema.safeParse(req.body);

    if (!body.success) {
      return res.status(422).json({ errors: body.error.errors });
    }

    const session = await getSession(req);

    await postRepository
      .create({
        ...body.data,
        authorId: session.userId,
      })
      .then((post) => res.status(201).json(post));
  }),
);

router.put(
  '/:postId',
  expressPromise(async (req, res) => {
    const body = updatePostSchema.safeParse(req.body);

    if (!body.success) {
      return res.status(422).json({ errors: body.error.errors });
    }

    const currentPost = await postRepository
      .find(req.params.postId)
      .then((post) => post)
      .catch(() => {
        res.status(404).json({ message: 'Post not found' });
        return null;
      });

    if (!currentPost) {
      return;
    }

    await postRepository
      .update(req.params.postId, {
        ...currentPost,
        ...body.data,
      })
      .then((post) => res.json(post));
  }),
);

router.delete(
  '/:postId',
  expressPromise(async (req, res) =>
    postRepository
      .delete(req.params.postId)
      .then(() => res.json({ message: 'Post deleted' }))
      .catch(() => res.status(404).json({ message: 'Post not found' })),
  ),
);

export const postsRoutes = router;

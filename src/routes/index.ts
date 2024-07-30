import { Router, Request, Response } from 'express';
import userRouter from './user.router';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.render('index', {
    title: 'Home Page',
    message: 'Hello, welcome to the home page!',
  });
});

router.use('/users', userRouter);

export default router;

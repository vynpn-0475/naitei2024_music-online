/* eslint-disable prettier/prettier */
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.render('index', {
    title: 'Home Page',
    message: 'Hello, welcome to the home page!',
  });
});

export default router;

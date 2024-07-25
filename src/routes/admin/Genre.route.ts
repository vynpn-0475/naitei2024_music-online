import { Router } from 'express';
import { createGet, createPost, list } from '@src/controller/Genre.controller';
import {
  detail,
  validateAndFetchGenre,
} from '@src/controller/Genre.controller';

const router = Router();

router.get('/create', createGet);
router.post('/create', createPost);

router.get('/', list);
router.get('/:id', validateAndFetchGenre, detail);

export default router;

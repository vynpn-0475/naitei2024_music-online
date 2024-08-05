import {
  createGet,
  createPost,
  deleteGet,
  deletePost,
  detail,
  list,
  updateGet,
  updatePost,
  validateAndFetchGenre,
} from '@src/controllers/admin/Genre.controller';
import { Router } from 'express';

const router = Router();

router.get('/create', createGet);
router.post('/create', createPost);

router.get('/delete/:id', validateAndFetchGenre, deleteGet);
router.post('/delete/:id', deletePost);

router.get('/update/:id', validateAndFetchGenre, updateGet);
router.post('/update/:id', updatePost);

router.get('/', list);
router.get('/:id', validateAndFetchGenre, detail);

export default router;

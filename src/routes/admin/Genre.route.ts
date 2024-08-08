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
import methodOverride from 'method-override';
import { Router } from 'express';

const router = Router();

router.use(methodOverride('_method'));

router.get('/create', createGet);
router.post('/create', createPost);

router.get('/delete/:id', validateAndFetchGenre, deleteGet);
router.delete('/delete/:id', validateAndFetchGenre, deletePost);

router.get('/update/:id', validateAndFetchGenre, updateGet);
router.put('/update/:id', validateAndFetchGenre, updatePost);

router.get('/', list);
router.get('/:id', validateAndFetchGenre, detail);

export default router;

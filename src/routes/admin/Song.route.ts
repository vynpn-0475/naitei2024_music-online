import {
  createGet,
  createPost,
  deleteGet,
  deletePost,
  detail,
  list,
  updateGet,
  updatePost,
  validateAndFetchSong,
} from '@src/controllers/admin/Song.controller';
import methodOverride from 'method-override';
import { uploadMedia } from '@src/middleware/multer.config';
import { Router } from 'express';

const router = Router();

router.use(methodOverride('_method'));

router.get('/create', createGet);
router.post('/create', uploadMedia, createPost);

router.get('/update/:id', validateAndFetchSong, updateGet);
router.put('/update/:id', validateAndFetchSong, uploadMedia, updatePost);

router.get('/delete/:id', validateAndFetchSong, deleteGet);
router.delete('/delete/:id', validateAndFetchSong, deletePost);

router.get('/', list);
router.get('/:id', validateAndFetchSong, detail);

export default router;

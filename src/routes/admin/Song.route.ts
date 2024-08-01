import { createGet, createPost, detail, list, updateGet, updatePost, validateAndFetchSong } from '@src/controller/Song.controller';
import { uploadMedia } from '../middleware/multer.config';
import { Router } from 'express';

const router = Router();

router.get('/create', createGet);
router.post('/create', uploadMedia, createPost);

router.get('/update/:id', validateAndFetchSong, updateGet);
router.post('/update/:id', uploadMedia, updatePost);

router.get('/', list);
router.get('/:id', validateAndFetchSong, detail);

export default router;

import { createGet, createPost } from '@src/controller/Song.controller';
import { uploadMedia } from '../middleware/multer.config';
import { Router } from 'express';

const router = Router();

router.get('/create', createGet);
router.post('/create', uploadMedia, createPost);

export default router;

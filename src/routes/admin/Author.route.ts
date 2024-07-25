import { Router } from 'express';
import { createGet, createPost, list } from '@src/controller/Author.controller';
import { uploadAvatar } from '../middleware/multer.config';

const router = Router();

router.get('/create', createGet);
router.post('/create', uploadAvatar, createPost);

router.get('/', list);

export default router;

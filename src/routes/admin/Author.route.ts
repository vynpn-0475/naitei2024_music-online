import { Router } from 'express';
import { createGet, createPost } from '@src/controller/Author.controller';
import { uploadAvatar } from '../middleware/multer.config';

const router = Router();

router.get('/create', createGet);
router.post('/create', uploadAvatar, createPost);

export default router;

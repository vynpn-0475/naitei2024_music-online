import { Router } from 'express';
import { createGet, createPost, detail, list, validateAndFetchAuthor } from '@src/controller/Author.controller';
import { uploadAvatar } from '../middleware/multer.config';

const router = Router();

router.get('/create', createGet);
router.post('/create', uploadAvatar, createPost);

router.get('/', list);
router.get('/:id', validateAndFetchAuthor, detail);

export default router;

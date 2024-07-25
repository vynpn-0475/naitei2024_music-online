import { Router } from 'express';
import { createGet, createPost, detail, list, updateGet, updatePost, validateAndFetchAuthor } from '@src/controller/Author.controller';
import { uploadAvatar } from '../middleware/multer.config';

const router = Router();

router.get('/create', createGet);
router.post('/create', uploadAvatar, createPost);

router.get('/update/:id', validateAndFetchAuthor, updateGet);
router.post('/update/:id', uploadAvatar, updatePost);

router.get('/', list);
router.get('/:id', validateAndFetchAuthor, detail);

export default router;

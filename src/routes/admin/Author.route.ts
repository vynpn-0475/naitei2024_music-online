import { Router } from 'express';
import { createGet, createPost, deleteGet, deletePost, detail, list, updateGet, updatePost, validateAndFetchAuthor } from '@src/controllers/Author.controller';
import { uploadAvatar } from '../middleware/multer.config';

const router = Router();

router.get('/create', createGet);
router.post('/create', uploadAvatar, createPost);

router.get('/delete/:id', validateAndFetchAuthor, deleteGet);
router.post('/delete/:id', deletePost);

router.get('/update/:id', validateAndFetchAuthor, updateGet);
router.post('/update/:id', uploadAvatar, updatePost);

router.get('/', list);
router.get('/:id', validateAndFetchAuthor, detail);

export default router;

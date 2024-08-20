import { Router } from 'express';
import {
  list,
  createGet,
  deleteGet,
  detail,
  createPost,
  deletePost,
  validateAndFetchPlaylist,
  addSongPost,
  removeSongPost,
} from '@src/controllers/user/Playlist.controller';
import { uploadAvatar } from '@src/middleware/multer.config';

const router = Router();

router.get('/', list);

router.get('/create', createGet);
router.post('/create', uploadAvatar, createPost);

router.get('/delete/:id', validateAndFetchPlaylist, deleteGet);
router.delete('/delete/:id', deletePost);

router.post('/add-song/:id', validateAndFetchPlaylist, addSongPost);
router.post('/remove-song/:id', validateAndFetchPlaylist, removeSongPost);

router.get('/:id', validateAndFetchPlaylist, detail);

export default router;

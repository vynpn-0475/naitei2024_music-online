import { Router } from 'express';
import {
  list,
  createGet,
  deleteGet,
  updatePost,
  detail,
  createPost,
  deletePost,
  updateGet,
  validateAndFetchPlaylist,
  addSongPost,
  removeSongPost,
} from '@src/controllers/admin/Playlist.controller';
import { uploadAvatar } from '@src/middleware/multer.config';

const router = Router();

router.get('/', list);

router.get('/create', createGet);
router.post('/create', uploadAvatar, createPost);

router.get('/delete/:id', validateAndFetchPlaylist, deleteGet);
router.delete('/delete/:id', deletePost);

router.get('/update/:id', validateAndFetchPlaylist, updateGet);
router.put('/update/:id', uploadAvatar, updatePost);

router.post('/add-song/:id', addSongPost);
router.post('/remove-song/:id', removeSongPost);

router.get('/:id', validateAndFetchPlaylist, detail);

export default router;

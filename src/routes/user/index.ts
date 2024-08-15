import { Router } from 'express';
import { UserController } from '@src/controllers/user/user.controller';
import authorRoutes from './Author.route';

import {
  showSectionAlbum,
  showSectionArtist,
  showSectionSong,
} from '@src/controllers/guess/index.controller';

const router = Router();

router.use('/authors', authorRoutes);

router.get('/', UserController.getHomeUser);

router.get('/account', UserController.getAccoutPage);

router.get('/account/edit-profile/:id', UserController.getEditProfile);
router.put('/account/edit-profile/:id', UserController.postEditProfile);
router.get('/section/artists', showSectionArtist);
router.get('/section/albums', showSectionAlbum);
router.get('/section/songs', showSectionSong);

export default router;

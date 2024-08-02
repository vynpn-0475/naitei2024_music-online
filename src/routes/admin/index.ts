import { Router } from 'express';
import genreRoutes from './Genre.route';
import authorRoutes from './Author.route';
import musicRoutes from './Song.route';
import playlistRoutes from './Playlist.route';

const router = Router();

router.use('/genres', genreRoutes);
router.use('/authors', authorRoutes);
router.use('/musics', musicRoutes);
router.use('/playlists', playlistRoutes);
router.use('/', genreRoutes);

export default router;

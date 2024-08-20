import { AlbumController } from '@src/controllers/user/Album.controller';
import { authorDetail, validateAndFetchAuthor } from '@src/controllers/user/Author.controller';
import { genreDetail, validateAndFetchGenre } from '@src/controllers/user/Genre.controller';
import { songDetail, validateAndFetchSong } from '@src/controllers/user/Song.controller';
import { Router } from 'express';

const router = Router();

router.get('/albums/:id', AlbumController.albumDetail);
router.get('/authors/:id', validateAndFetchAuthor, authorDetail);
router.get('/genres/:id', validateAndFetchGenre,genreDetail);
router.get('/musics/:id', validateAndFetchSong, songDetail);

export default router;

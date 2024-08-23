import { Genre } from '@src/entities/Genre.entity';
import {
  getGenreById,
} from '@src/services/Genre.service';
import {
  countSongsByGenreId,
  getSongsByGenreId,
} from '@src/services/Song.service';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { TFunction } from 'i18next';

interface GenreRequest extends Request {
  genre?: Genre;
  t: TFunction;
}

export async function validateAndFetchGenre(
  req: GenreRequest,
  res: Response,
  next: NextFunction
) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    req.flash('error_msg', req.t('error.invalidGenreId'));
    return res.redirect('/error');
  }

  try {
    const genre = await getGenreById(id);
    if (genre === null) {
      req.flash('error_msg', req.t('error.genreNotFound'));
      return res.redirect('/error');
    }
    req.genre = genre;
    next();
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchGenres'));
    return res.redirect('/error');
  }
}

export const genreDetail = asyncHandler(async (req: GenreRequest, res: Response) => {
  try {
    const genre = (req as any).genre;
    if (!genre) {
      req.flash('error_msg', req.t('error.genreNotFound'));
      return res.redirect('/error');
    }

    const songs = await getSongsByGenreId(req, genre.id);
    const countSong = await countSongsByGenreId(req, genre.id);

    res.render('pages/detail/genres', {
      genre,
      songs,
      countSong,
      title: req.t('genres.titleDetailGenre'),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchGenres'));
    res.redirect('/error');
  }
});

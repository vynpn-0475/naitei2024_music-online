import { Genre } from '@src/entities/Genre.entity';
import {
  getGenreById,
} from '@src/services/Genre.service';
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
    if (!genre) {
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

export const genreDetail = asyncHandler((req: GenreRequest, res: Response) => {
  const user = req.session.user;
  
  if (!user) {
    req.flash('error_msg', req.t('error.unauthorized'));
    return res.redirect('/login');
  }

  const genre = req.genre;

  if (!genre) {
    req.flash('error_msg', req.t('error.genreNotFound'));
    return res.redirect('/error');
  }
});

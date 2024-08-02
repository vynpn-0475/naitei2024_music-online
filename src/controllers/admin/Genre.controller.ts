import { Genre } from '@src/entities/Genre.entity';
import { getGenreById, getGenres } from '@src/services/Genre.service';
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

export const list = asyncHandler(async (req: Request, res: Response) => {
  try {
    const genres = await getGenres();
    res.render('genres/index', {
      genres,
      title: req.t('genres.title'),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchGenres'));
    res.redirect('/error');
  }
});

export const detail = asyncHandler((req: GenreRequest, res: Response) => {
  try {
    if (!req.genre) {
      req.flash('error_msg', req.t('error.genreNotFound'));
      return res.redirect('/error');
    }
    const genre = req.genre;
    res.render('genres/detail', {
      genre,
      title: req.t('genres.titleDetailGenre'),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchGenres'));
    res.redirect('/error');
  }
});
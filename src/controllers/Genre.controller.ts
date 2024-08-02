import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createGenre, deleteGenre, getGenreById, getGenres, updateGenre } from '../services/Genre.service';
import { Genre } from '@src/entities/Genre.entity';
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
    const genre = await getGenreById(id, req.t);
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

export const list = asyncHandler(async (req: GenreRequest, res: Response) => {
  try {
    const genres = await getGenres(req.t);
    res.render('genres/index', {
      genres,
      title: req.t('genres.title'),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchGenres'));
    res.redirect('/error');
  }
});

export const detail = asyncHandler(async (req: GenreRequest, res: Response) => {
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
    return res.redirect('/error');
  }
});

export const createGet = (req: GenreRequest, res: Response) => {
  res.render('genres/create', {
    title: req.t('genres.createNewGenre'),
  });
};

export const createPost = async (req: GenreRequest, res: Response) => {
  try {
    const { name } = req.body;
    const genre = await createGenre({ name }, req.t);
    res.redirect(`/admin/genres/${genre.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send(req.t('error.failedToCreateGenre'));
  }
};

export const updateGet = async (req: GenreRequest, res: Response, next: NextFunction) => {
  try {
    const genre = req.genre;
    res.render('genres/update', {
      title: req.t('genres.updateGenre'),
      genre,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(req.t('error.failedToFetchGenres'));
  }
};

export const updatePost = async (req: GenreRequest, res: Response) => {
  try {
    const genreId = parseInt(req.params.id, 10);
    const { name } = req.body;

    const genre = await updateGenre(genreId, { name }, req.t);
    res.redirect(`/admin/genres/${genre.id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send(req.t('error.failedToUpdateGenre'));
  }
};

export const deleteGet = async (req: GenreRequest, res: Response, next: NextFunction) => {
  try {
    const genre = req.genre;
    res.render('genres/delete', {
      title: req.t('genres.updateGenre'),
      genre,
      t: req.t,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(req.t('error.failedToFetchGenres'));
  }
};

export const deletePost = async (req: GenreRequest, res: Response) => {
  try {
    const genreId = parseInt(req.params.id, 10);
    await deleteGenre(genreId, req.t);
    res.redirect('/admin/genres');
  } catch (error) {
    console.error(error);
    res.status(500).send(req.t('error.failedToDeleteGenre'));
  }
};

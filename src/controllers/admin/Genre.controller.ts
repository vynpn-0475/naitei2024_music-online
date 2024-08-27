import { Genre } from '@src/entities/Genre.entity';
import {
  createGenre,
  deleteGenre,
  getGenreById,
  getGenresPage,
  updateGenre,
} from '@src/services/Genre.service';
import {
  countSongsByGenreId,
  getSongsByGenreId,
} from '@src/services/Song.service';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { TFunction } from 'i18next';
import { PAGE_SIZE } from '../../constants/const';

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
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = PAGE_SIZE;
  const query = (req.query.query as string) || '';

  try {
    const { genres, total } = await getGenresPage(
      page,
      pageSize,
      'name',
      'ASC',
      query
    );
    const totalPages = Math.ceil(total / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages));

    res.render('genres/index', {
      genres,
      title: req.t('genres.title'),
      currentPage,
      totalPages,
      baseUrl: '/admin/genres',
      query,
      noGenresMessage: !genres.length ? req.t('genres.noMatchingGenres') : null,
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchGenres'));
    res.redirect('/error');
  }
});

export const detail = asyncHandler(async (req: GenreRequest, res: Response) => {
  try {
    const genre = (req as any).genre;
    if (!genre) {
      req.flash('error_msg', req.t('error.genreNotFound'));
      return res.redirect('/error');
    }

    const songs = await getSongsByGenreId(req, genre.id);
    const countSong = await countSongsByGenreId(req, genre.id);

    res.render('genres/detail', {
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

export const createGet = (req: GenreRequest, res: Response) => {
  res.render('genres/create', {
    title: req.t('genres.createNewGenre'),
  });
};

export const createPost = async (req: GenreRequest, res: Response) => {
  try {
    const { name } = req.body;
    const genre = await createGenre({ name }, req.t);
    req.flash('success_msg', req.t('genre.successfullyCreated'));
    res.redirect(`/admin/genres/${genre.id}`);
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToCreateGenre'));
    res.redirect('/admin/genres/create');
  }
};

export const updateGet = (req: GenreRequest, res: Response) => {
  try {
    const genre = (req as any).genre;
    res.render('genres/update', {
      title: req.t('genres.updateGenre'),
      genre,
      flash: req.flash(),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchGenres'));
    res.redirect('/error');
  }
};

export const updatePost = async (req: GenreRequest, res: Response) => {
  try {
    const { name } = req.body;
    const gen = (req as any).genre;
    const genre = await updateGenre(gen.id, { name }, req.t);
    req.flash('success_msg', req.t('genre.successfullyUpdated'));
    res.redirect(`/admin/genres/${genre.id}`);
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToUpdateGenre'));
    res.redirect(`/admin/genres/update/${req.params.id}`);
  }
};

export const deleteGet = async (req: GenreRequest, res: Response) => {
  try {
    const genre = (req as any).genre;
    const songs = await getSongsByGenreId(req, genre.id);
    res.render('genres/delete', {
      title: req.t('genres.deleteGenre'),
      genre,
      songs,
      t: req.t,
      flash: req.flash(),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchGenres'));
    res.redirect('/error');
  }
};

export const deletePost = async (req: GenreRequest, res: Response) => {
  try {
    const genre = (req as any).genre;
    await deleteGenre(genre.id, req.t);
    req.flash('success_msg', req.t('genre.successfullyDeleted'));
    res.redirect('/admin/genres');
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToDeleteGenre'));
    res.redirect(`/admin/genres/${req.params.id}/delete`);
  }
};

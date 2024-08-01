import { getGenres } from '@src/services/Genre.service';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

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

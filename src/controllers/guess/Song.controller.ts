import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { getSongById } from '@src/services/Song.service';

export const validateAndFetchSong = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    req.flash('error_msg', req.t('error.invalidSongId'));
    return res.redirect('/error');
  }
  try {
    const song = await getSongById(req, id);
    if (song === null) {
      req.flash('error_msg', req.t('error.songNotFound'));
      return res.redirect('/error');
    }
    (req as any).song = song;
    next();
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchSongs'));
    res.redirect('/error');
  }
};

export const songDetail = asyncHandler(async (req: Request, res: Response) => {
  const user = req.session.user;
  if (!user) {
    req.flash('error_msg', req.t('error.unauthorized'));
    return res.redirect('/login');
  }
});

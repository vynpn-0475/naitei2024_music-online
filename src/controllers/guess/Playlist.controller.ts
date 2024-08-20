import { Playlist } from '@src/entities/Playlist.entity';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getPlaylistById,
} from '@src/services/Playlist.service';

declare module 'express-serve-static-core' {
  interface Request {
    playlist?: Playlist;
  }
}

export const validateAndFetchPlaylist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    req.flash('error_msg', req.t('error.invalidPlaylistId'));
    return res.redirect('/error');
  }
  try {
    const playlist = await getPlaylistById(id, req);
    if (playlist === null) {
      req.flash('error_msg', req.t('error.playlistNotFound'));
      return res.redirect('/error');
    }
    (req as any).playlist = playlist;
    next();
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchPlaylists'));
    res.redirect('/error');
  }
};

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const user = req.session.user;
  if (!user) {
    req.flash('error_msg', req.t('error.unauthorized'));
    return res.redirect('/login');
  }
});


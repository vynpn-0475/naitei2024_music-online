import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { getSongById, getSongsBySameAuthor } from '@src/services/Song.service';
import { SongStatus } from '@src/enums/SongStatus.enum';
import { getAllPlaylistByUser } from '@src/services/Playlist.service';

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
  try {
    const user = req.session.user;
    const song = (req as any).song;
    const suggestedSongs = await getSongsBySameAuthor(
      req,
      song.author.id,
      song.id,
      user?.role
    );
    const allPlaylists = await getAllPlaylistByUser(
      req,
      user?.role,
      user?.username
    );
    const playlists = allPlaylists.filter(
      (playlist) =>
        !playlist.songs.some((existingSong) => existingSong.id === song.id)
    );

    res.render('pages/detail/songs', {
      song,
      currentStatus: SongStatus.Deleted,
      title: req.t('songs.detail.title'),
      playlists,
      countPlaylist: playlists.length,
      suggestedSongs,
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchSong'));
    res.redirect('/error');
  }
});

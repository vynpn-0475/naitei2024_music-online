import { Playlist } from '@src/entities/Playlist.entity';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylistsPage,
  removeSongFromPlaylist,
} from '@src/services/Playlist.service';
import { getAllSongs, getSongsByIds } from '@src/services/Song.service';
import { Song } from '@src/entities/Song.entity';
import { SongStatus } from '@src/enums/SongStatus.enum';
import { PAGE_SIZE } from '@src/constants/const';
import { PlaylistTypes } from '@src/enums/PlaylistTypes.enum';
import { uploadFileToFirebase } from '@src/utils/fileUpload.utils';

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

export const list = asyncHandler(async (req: Request, res: Response) => {
  const t = req.t;
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = PAGE_SIZE;

  try {
    const user = req.session.user;
    const { playlists: userPlaylist, total: totalPlaylistUser } =
      await getPlaylistsPage(page, pageSize, user?.role, user?.username, false);
    const { playlists: systemPlaylist, total: totalPlaylistSystem } =
      await getPlaylistsPage(page, pageSize, undefined, undefined, true);

    const totalPagesUser = Math.ceil(totalPlaylistUser / pageSize);
    const currentPageUser = Math.max(1, Math.min(page, totalPagesUser));

    const totalPagesSystem = Math.ceil(totalPlaylistSystem / pageSize);
    const currentPageSystem = Math.max(1, Math.min(page, totalPagesSystem));

    if (!userPlaylist.length) {
      req.flash('error_msg', t('error.noPlaylists'));
      return res.render('pages/playlists', {
        playlists: [],
        title: req.t('playlist.title'),
        currentPageUser,
        totalPagesUser,
        baseUrl: '/user/playlists',
        systemPlaylist,
      });
    }

    res.render('pages/playlists', {
      playlists: userPlaylist,
      title: req.t('playlist.title'),
      currentPageUser,
      totalPagesUser,

      systemPlaylist,
      titleSystem: req.t('playlist.titleSytem'),
      currentPageSystem,
      totalPlaylistSystem,

      baseUrl: '/user/playlists',
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchPlaylists'));
    res.redirect('/error');
  }
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.session.user;
    const playlist = (req as any).playlist;
    const songs = await getAllSongs(req, user?.role);
    const playlistSongIds = (playlist.songs as Song[]).map(
      (song: Song) => song.id
    );

    const availableSongs = songs.filter(
      (song: Song) => !playlistSongIds.includes(song.id)
    );

    const firstSong = playlist.songs.length > 0 ? playlist.songs[0] : null;
    res.render('pages/playlists/detail', {
      playlist,
      title: req.t('playlist.detail'),
      songs: playlist.songs,
      availableSongs,
      length: playlist.songs.length,
      currentStatus: SongStatus.Deleted,
      firstSong,
      userType: PlaylistTypes.User,
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchPlaylists'));
    res.redirect('/error');
  }
});

export const addSongPost = asyncHandler(async (req: Request, res: Response) => {
  try {
    const playlist = (req as any).playlist;
    const { songId } = req.body;

    await addSongToPlaylist(req, playlist.id, songId);
    res.redirect(`/user/playlists/${playlist.id}`);
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToAddSongPlaylist'));
    res.status(500).json({ success: false, message: error.message });
  }
});

export const removeSongPost = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const playlist = (req as any).playlist;
      const { songId } = req.body;
      await removeSongFromPlaylist(req, playlist.id, Number(songId));
      res.redirect(`/user/playlists/${playlist.id}`);
    } catch (error) {
      req.flash('error_msg', req.t('error.failedToRemoveSongPlaylist'));
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export const createGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = req.session.user;
    const songs = await getAllSongs(req, user?.role);

    res.render('pages/playlists/create', {
      songs,
      title: req.t('playlist.createNewPlaylist'),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchPlaylists'));
    res.redirect('/error');
  }
});

export const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.session.user;
    const { title, songIds, type } = req.body;
    const songs = await getSongsByIds(req, songIds);

    let avatarUrl = '';

    if (req.file) {
      avatarUrl = await uploadFileToFirebase(
        req.file.buffer,
        req.file.originalname,
        'playlist',
        req.file.mimetype
      );
    }

    const playlist = await createPlaylist(
      req,
      {
        title,
        avatar: avatarUrl,
        songs,
        type,
      },
      user?.role,
      user?.username
    );

    res.redirect(`/user/playlists/${playlist.id}`);
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToCreatePlaylist'));
    res
      .status(500)
      .send(
        req.t('error.errorCreatingPlaylist', { errorMessage: error.message })
      );
  }
};

export const deleteGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const playlist = (req as any).playlist;
    const songs = await getAllSongs(req);
    res.render('pages/playlists/delete', {
      title: req.t('playlist.deletePlaylist'),
      playlist,
      songs,
      length: playlist.songs.length,
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchPlaylists'));
    res.status(500).send(req.t('error.failedToFetchPlaylists'));
  }
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  try {
    const playlist = (req as any).playlist;
    await deletePlaylist(req, playlist.id);
    res.redirect('/user/playlists');
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToDeletePlaylist'));
    res
      .status(500)
      .send(
        req.t('error.errorDeletingPlaylist', { errorMessage: error.message })
      );
  }
});

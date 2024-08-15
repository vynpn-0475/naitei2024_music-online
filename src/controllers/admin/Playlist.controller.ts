import { Playlist } from '@src/entities/Playlist.entity';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { uploadFileToFirebase } from '@src/utils/fileUpload.utils';
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllPlaylists,
  getPlaylistById,
  removeSongFromPlaylist,
  updatePlaylist,
} from '@src/services/Playlist.service';
import { getAllSongs, getSongsByIds } from '@src/services/Song.service';
import { PlaylistTypes } from '@src/enums/PlaylistTypes.enum';
import { Song } from '@src/entities/Song.entity';

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
  try {
    const playlists = await getAllPlaylists(req);
    res.render('playlists/index', {
      playlists,
      title: req.t('playlist.title'),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchPlaylists'));
    res.redirect('/error');
  }
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  try {
    const playlist = req.playlist as Playlist;
    const songs = await getAllSongs(req);

    const playlistSongIds = playlist.songs.map((song: Song) => song.id);

    const availableSongs = songs.filter(
      (song: Song) => !playlistSongIds.includes(song.id)
    );

    const firstSong = playlist.songs.length > 0 ? playlist.songs[0] : null;

    res.render('playlists/detail', {
      playlist,
      title: req.t('playlist.detail'),
      songs: playlist.songs,
      availableSongs,
      length: playlist.songs.length,
      firstSong,
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchPlaylists'));
    res.redirect('/error');
  }
});

export const addSongPost = asyncHandler(async (req: Request, res: Response) => {
  try {
    const playlistId = parseInt(req.params.id, 10);
    const { songId } = req.body;

    await addSongToPlaylist(req, playlistId, songId);
    res.redirect(`/admin/playlists/${playlistId}`);
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToAddSongPlaylist'));
    res.status(500).json({ success: false, message: error.message });
  }
});

export const removeSongPost = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const playlistId = parseInt(req.params.id, 10);
      const { songId } = req.body;
      await removeSongFromPlaylist(req, playlistId, Number(songId));
      res.redirect(`/admin/playlists/${playlistId}`);
    } catch (error) {
      req.flash('error_msg', req.t('error.failedToRemoveSongPlaylist'));
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export const createGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const songs = await getAllSongs(req);
    const playlistTypes = Object.values(PlaylistTypes);

    res.render('playlists/create', {
      songs,
      playlistTypes,
      title: req.t('playlist.createNewPlaylist'),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchPlaylists'));
    res.redirect('/error');
  }
});

export const createPost = async (req: Request, res: Response) => {
  try {
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

    const playlist = await createPlaylist(req, {
      title,
      avatar: avatarUrl,
      songs,
      type,
    });

    res.redirect(`/admin/playlists/${playlist.id}`);
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToCreatePlaylist'));
    res
      .status(500)
      .send(
        req.t('error.errorCreatingPlaylist', { errorMessage: error.message })
      );
  }
};

export const updateGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const playlist = (req as any).playlist;
    const playlistTypes = Object.values(PlaylistTypes);
    const songs = await getAllSongs(req);

    res.render('playlists/update', {
      title: req.t('playlist.updatePlaylist'),
      playlist,
      songs,
      playlistTypes,
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToFetchPlaylists'));
    res.status(500).send(req.t('error.failedToFetchPlaylists'));
  }
});

export const updatePost = async (req: Request, res: Response) => {
  try {
    const playlistId = parseInt(req.params.id, 10);
    const { title, songIds, type } = req.body;

    const currentPlaylist = await getPlaylistById(playlistId, req);

    let avatarUrl = currentPlaylist?.avatar;
    if (req.file) {
      avatarUrl = await uploadFileToFirebase(
        req.file.buffer,
        req.file.originalname,
        'playlists',
        req.file.mimetype
      );
    }

    const updatedData: Partial<Playlist> = {
      title: title || currentPlaylist?.title,
      avatar: avatarUrl,
      songs: songIds
        ? await getSongsByIds(req, songIds)
        : currentPlaylist?.songs,
      type: type || currentPlaylist?.type,
    };

    const updatedPlaylist = await updatePlaylist(req, playlistId, updatedData);

    res.redirect(`/admin/playlists/${updatedPlaylist.id}`);
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToUpdatePlaylist'));
    res
      .status(500)
      .send(
        req.t('error.errorUpdatingPlaylist', { errorMessage: error.message })
      );
  }
};

export const deleteGet = asyncHandler(async (req: Request, res: Response) => {
  try {
    const playlist = (req as any).playlist;
    const songs = await getAllSongs(req);
    res.render('playlists/delete', {
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
    const playlistId = parseInt(req.params.id, 10);
    await deletePlaylist(req, playlistId);
    res.redirect('/admin/playlists');
  } catch (error) {
    req.flash('error_msg', req.t('error.failedToDeletePlaylist'));
    res
      .status(500)
      .send(
        req.t('error.errorDeletingPlaylist', { errorMessage: error.message })
      );
  }
});

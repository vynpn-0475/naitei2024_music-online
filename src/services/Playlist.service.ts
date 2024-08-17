import { AppDataSource } from '../config/data-source';
import { Playlist } from '../entities/Playlist.entity';
import { getSongById } from './Song.service';
import { Request, request } from 'express';

const playlistRepository = AppDataSource.getRepository(Playlist);

export const getPlaylistsPage = async (
  page: number,
  pageSize: number = 6,
  sortField: keyof Playlist = 'title',
  sortOrder: 'ASC' | 'DESC' = 'ASC'
) => {
  const [playlists, total] = await playlistRepository.findAndCount({
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: {
      [sortField]: sortOrder,
    },
  });
  return { playlists, total };
};

export const getPlaylistById = async (playlistId: number, req: Request) => {
  try {
    return await playlistRepository.findOne({
      where: { id: playlistId },
      relations: ['songs', 'songs.author', 'users'],
    });
  } catch (error) {
    throw new Error(req.t('error.failedToFetchPlaylists'));
  }
};

export const createPlaylist = async (req: Request, data: Partial<Playlist>) => {
  try {
    const playlist = new Playlist(data);
    await playlist.save();
    return playlist;
  } catch (error) {
    throw new Error(req.t('error.failedToCreatePlaylist'));
  }
};

export const addSongToPlaylist = async (
  req: Request,
  playlistId: number,
  songId: number
) => {
  const playlist = await playlistRepository.findOne({
    where: { id: playlistId },
    relations: ['songs'],
  });
  if (!playlist) {
    throw new Error(req.t('error.playlistNotFound'));
  }

  const song = await getSongById(request, songId);
  if (!song) {
    throw new Error(req.t('error.songNotFound'));
  }

  if (!playlist.songs) {
    playlist.songs = [];
  }

  playlist.songs.push(song);
  await playlist.save();
};

export const removeSongFromPlaylist = async (
  req: Request,
  playlistId: number,
  songId: number
) => {
  const playlist = await playlistRepository.findOne({
    where: { id: playlistId },
    relations: ['songs'],
  });

  if (!playlist) {
    throw new Error(req.t('error.failedToRemoveSongPlaylist'));
  }

  if (!playlist.songs) {
    playlist.songs = [];
  }
  const songExists = playlist.songs.some((s) => s.id === songId);
  if (!songExists) {
    throw new Error(req.t('error.songNotFound'));
  }

  playlist.songs = playlist.songs.filter((s) => s.id !== songId);
  await playlist.save();
};

export const updatePlaylist = async (
  req: Request,
  playlistId: number,
  data: Partial<Playlist>
) => {
  try {
    const playlist = await playlistRepository.findOne({
      where: { id: playlistId },
    });
    if (!playlist) {
      throw new Error(req.t('error.playlistNotFound'));
    }
    Object.assign(playlist, data);
    await playlist.save();
    return playlist;
  } catch (error) {
    throw new Error(req.t('error.failedToUpdatePlaylist'));
  }
};

export const deletePlaylist = async (req: Request, playlistId: number) => {
  try {
    const playlist = await playlistRepository.findOne({
      where: { id: playlistId },
    });
    if (!playlist) {
      throw new Error(req.t('error.playlistNotFound'));
    }
    await playlist.remove();
  } catch (error) {
    throw new Error(req.t('error.failedToDeletePlaylist'));
  }
};

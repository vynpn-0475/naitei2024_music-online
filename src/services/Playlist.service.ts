import { UserRoles } from '@src/enums/UserRoles.enum';
import { AppDataSource } from '../config/data-source';
import { Playlist } from '../entities/Playlist.entity';
import { getSongById } from './Song.service';
import { Request, request } from 'express';
import { PlaylistTypes } from '@src/enums/PlaylistTypes.enum';
import { User } from '@src/entities/User.entity';
import { Like } from 'typeorm';
import userService from './user.service';

const playlistRepository = AppDataSource.getRepository(Playlist);

export const getPlaylistsPage = async (
  page: number,
  pageSize: number = 6,
  role?: string,
  username?: string,
  isSystemPlaylist: boolean = false,
  sortField: keyof Playlist = 'title',
  sortOrder: 'ASC' | 'DESC' = 'ASC',
  query: string = ''
) => {
  let userId: number | undefined;

  if (role && username) {
    const user = await userService.findByUsername(username);
    if (user) {
      userId = user.id;
    }
  }

  const whereConditions: any = {
    title: Like(`%${query}%`),
  };

  if (userId) {
    whereConditions.users = { id: userId };
  }

  if (isSystemPlaylist) {
    whereConditions.type = PlaylistTypes.System;
  }

  const [playlists, total] = await playlistRepository.findAndCount({
    where: whereConditions,
    skip: (page - 1) * pageSize,
    take: pageSize,
    order: {
      [sortField]: sortOrder,
    },
    relations: ['users'],
  });

  return { playlists, total };
};

export const getAllPlaylistByUser = async (
  req: Request,
  role?: string,
  username?: string
) => {
  try {
    const whereConditions: any = {};

    if (role && username) {
      const user = await userService.findByUsername(username);
      if (user) {
        whereConditions.users = { id: user.id };
      }
    }

    const playlists = await playlistRepository.find({
      where: whereConditions,
      relations: ['songs', 'songs.author', 'users'],
    });

    return playlists;
  } catch (error) {
    throw new Error(req.t('error.failedToFetchPlaylists'));
  }
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

export const createPlaylist = async (
  req: Request,
  data: Partial<Playlist>,
  role?: string,
  username?: string
) => {
  try {
    data.type =
      role === UserRoles.User ? PlaylistTypes.User : PlaylistTypes.System;

    const playlist = new Playlist(data);

    await playlist.save();

    if (role === UserRoles.User && username) {
      const user = await User.findOne({
        where: { username },
        relations: ['playlists'],
      });

      if (user) {
        user.playlists = [...(user.playlists || []), playlist];
        await user.save();
      }
    }

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

export const searchPlaylists = async (query: string) => {
  return await playlistRepository
    .createQueryBuilder('playlist')
    .where('playlist.title LIKE :query', { query: `%${query}%` })
    .getMany();
};

export const getPlaylistByUserId = async (
  userId: number
): Promise<Playlist[]> => {
  return await playlistRepository
    .createQueryBuilder('playlist')
    .leftJoinAndSelect('playlist.users', 'user')
    .leftJoinAndSelect('playlist.songs', 'song')
    .where('user.id = :userId', { userId })
    .getMany();
};

export const getPlaylistByUserIdAndTitle = async (
  userId: number,
  playlistTitle: string
): Promise<Playlist | null> => {
  return await playlistRepository
    .createQueryBuilder('playlist')
    .leftJoinAndSelect('playlist.users', 'user')
    .leftJoinAndSelect('playlist.songs', 'song')
    .where('user.id = :userId', { userId })
    .andWhere('playlist.title = :playlistTitle', { playlistTitle })
    .getOne(); // Sử dụng getOne() vì bạn muốn tìm một playlist duy nhất
};

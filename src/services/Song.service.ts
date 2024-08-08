import { AppDataSource } from '@src/config/data-source';
import { Genre } from '@src/entities/Genre.entity';
import { Song } from '@src/entities/Song.entity';
import { TFunction } from 'i18next';

const songRepository = AppDataSource.getRepository(Song);

export const countSongsByGenreId = async (genreId: number, t: TFunction) => {
  try {
    return await songRepository.count({ where: { genres: { id: genreId } } });
  } catch (error) {
    throw new Error(t('error.countSongsByGenre'));
  }
};

export const getAllSongs = async (t: TFunction) => {
  try {
    return await songRepository.find();
  } catch (error) {
    throw new Error(t('error.failedToFetchSongs'));
  }
};

export const getSongById = async (songId: number, t: TFunction) => {
  try {
    return await songRepository.findOne({
      where: { id: songId },
      relations: ['author', 'album', 'genres'],
    });
  } catch (error) {
    throw new Error(t('error.failedToFetchSongs'));
  }
};

export const getSongsByGenreId = async (genreId: number, t: TFunction) => {
  try {
    return await songRepository.find({
      where: { genres: { id: genreId } },
      relations: ['genres'],
    });
  } catch (error) {
    throw new Error(t('error.failedToFetchSongs'));
  }
};

export const getSongsByAuthorId = async (authorId: number, t: TFunction) => {
  try {
    return await songRepository.find({
      where: { author: { id: authorId } },
      relations: ['author'],
    });
  } catch (error) {
    throw new Error(t('error.failedToFetchSongs'));
  }
};

export const countSongsByAuthorId = async (authorId: number, t: TFunction) => {
  try {
    return await songRepository.count({ where: { author: { id: authorId } } });
  } catch (error) {
    throw new Error(t('error.countSongsByGenre'));
  }
};

export const createSong = async (data: Partial<Song>, t: TFunction) => {
  try {
    const song = new Song(data);
    await song.save();
    return song;
  } catch (error) {
    throw new Error(t('error.failedToCreateSong'));
  }
};

export const updateSong = async (
  songId: number,
  data: Partial<Song>,
  t: TFunction
) => {
  try {
    const song = await songRepository.findOne({ where: { id: songId } });
    if (!song) {
      throw new Error(t('error.songNotFound'));
    }
    Object.assign(song, data);
    await song.save();
    return song;
  } catch (error) {
    throw new Error(t('error.failedToUpdateSong'));
  }
};

export const updateSongGenres = async (songId: number, genres: Genre[]) => {
  const song = await Song.findOne({ where: { id: songId }, relations: ['genres'] });
  if (!song) {
    throw new Error('Song not found');
  }
  song.genres = genres;
  await song.save();
};

export const deleteSong = async (songId: number, t: TFunction) => {
  try {
    const song = await songRepository.findOne({ where: { id: songId } });
    if (!song) {
      throw new Error(t('error.songNotFound'));
    }
    await song.remove();
  } catch (error) {
    throw new Error(t('error.failedToDeleteSong'));
  }
};

import { In } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Song } from '../entities/Song.entity';

const songRepository = AppDataSource.getRepository(Song);

export const getAllSongs = async () => {
  try {
    return await songRepository.find();
  } catch (error) {
    throw new Error('Error fetching songs');
  }
};

export const getSongById = async (songId: number) => {
  try {
    return await songRepository.findOne({where: { id: songId }, relations: ['author', 'album', 'genres']});
  } catch (error) {
    throw new Error('Error fetching song');
  }
};

export const getSongsByIds = async (songIds: number[]) => {
  try {
    return await songRepository.find({where: { id: In(songIds) }, relations: ['author', 'album', 'genres']});
  } catch (error) {
    throw new Error('Error fetching songs by IDs');
  }
};

export const createSong = async (data: Partial<Song>) => {
  try {
    const song = new Song(data);
    await song.save();
    return song;
  } catch (error) {
    throw new Error('Error creating song');
  }
}

export const updateSong = async (songId: number, data: Partial<Song>) => {
  try {
    const song = await songRepository.findOne({ where: { id: songId } });
    if (!song) {
      throw new Error('Song not found');
    }
    Object.assign(song, data);
    await song.save();
    return song;
  } catch (error) {
    throw new Error('Error updating song');
  }
};

export const deleteSong = async (songId: number) => {
  try {
      const song = await songRepository.findOne({ where: { id: songId } });
      if (!song) {
        throw new Error('Song not found');
      }
      await song.remove();
    } catch (error) {
      throw new Error('Error deleting song');
    }
};

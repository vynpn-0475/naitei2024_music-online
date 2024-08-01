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

export const createSong = async (data: Partial<Song>) => {
  try {
    const song = new Song(data);
    await song.save();
    return song;
  } catch (error) {
    throw new Error('Error creating song');
  }
}

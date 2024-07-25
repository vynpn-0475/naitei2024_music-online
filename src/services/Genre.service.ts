import { AppDataSource } from '../config/data-source';
import { Genre } from '../entities/Genre.entity';

const genreRepository = AppDataSource.getRepository(Genre);

export const getGenres = async () => {
  return genreRepository.find();
};

export const getGenreById = async (genreId: number) => {
  return await genreRepository.findOne({
    where: { id: genreId },
    relations: ['songs'],
  });
};

export const createGenre = async (data: Partial<Genre>) => {
  try {
    const genre = new Genre(data);
    await genre.save();
    return genre;
  } catch (error) {
    throw new Error('Error creating genre');
  }
};

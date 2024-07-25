import { AppDataSource } from '../config/data-source';
import { Genre } from '../entities/Genre.entity';
import { TFunction } from 'i18next';

const genreRepository = AppDataSource.getRepository(Genre);

export const getGenres = async (t: TFunction) => {
  try {
    return await genreRepository.find();
  } catch (error) {
    throw new Error(t('error.failedToFetchGenres'));
  }
};

export const getGenreById = async (genreId: number, t: TFunction) => {
  try {
    return await genreRepository.findOne({
      where: { id: genreId },
      relations: ['songs'],
    });
  } catch (error) {
    throw new Error(t('error.failedToFetchGenre'));
  }
};

export const createGenre = async (data: Partial<Genre>, t: TFunction) => {
  try {
    const genre = new Genre();
    Object.assign(genre, data);
    await genre.save();
    return genre;
  } catch (error) {
    throw new Error(t('error.failedToCreateGenre'));
  }
};

export const updateGenre = async (genreId: number, data: Partial<Genre>, t: TFunction) => {
  try {
    const genre = await genreRepository.findOne({ where: { id: genreId } });
    if (!genre) {
      throw new Error(t('error.genreNotFound'));
    }
    Object.assign(genre, data);
    await genre.save();
    return genre;
  } catch (error) {
    throw new Error(t('error.failedToUpdateGenre'));
  }
};

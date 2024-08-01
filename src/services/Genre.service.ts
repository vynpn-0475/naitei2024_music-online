import { AppDataSource } from '../config/data-source';
import { Genre } from '../entities/Genre.entity';

const genreRepository = AppDataSource.getRepository(Genre);

export const getGenres = async (sortField: keyof Genre = 'name', sortOrder: 'ASC' | 'DESC' = 'ASC') => {
  return genreRepository.find({
    order: {
      [sortField]: sortOrder,
    },
  });
};

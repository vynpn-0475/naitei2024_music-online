import { AppDataSource } from '../config/data-source';
import { Author } from '../entities/Author.entity';

const authorRepository = AppDataSource.getRepository(Author);

export const getAuthors = async () => {
  return await authorRepository.find();
};

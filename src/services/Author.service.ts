import { AppDataSource } from '../config/data-source';
import { Author } from '../entities/Author.entity';

const authorRepository = AppDataSource.getRepository(Author);

export const getAuthors = async () => {
  return  authorRepository.find();
};

export const createAuthor = async (data: Partial<Author>) => {
  try {
    const author = new Author(data);
    await author.save();
    return author;
  } catch (error) {
    throw new Error('Error creating author');
  }
};

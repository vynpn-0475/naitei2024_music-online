import { AppDataSource } from '../config/data-source';
import { Author } from '../entities/Author.entity';

const authorRepository = AppDataSource.getRepository(Author);

export const getAuthors = async () => {
  return  authorRepository.find();
};

export const getAuthorById = async (authorId: number) => {
  try {
    return await Author.findOne({ where: { id: authorId }, relations: ['songs', 'albums'] });
  } catch (error) {
    throw new Error('Error fetching author');
  }
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

import { AppDataSource } from '../config/data-source';
import { Repository } from 'typeorm';
import { Author } from '../entities/Author.entity';
import * as authorService from '../services/Author.service';
import { mockTFunction } from '../path/mockTFunction';

describe('AuthorService', () => {
  let authorRepository: Repository<Author>;

  beforeAll(async () => {
    await AppDataSource.initialize();
    authorRepository = AppDataSource.getRepository(Author);
    await authorRepository.insert([
      { fullname: 'John Doe', dateOfBirth: new Date('1990-01-01'), bio: '' },
      { fullname: 'Jane Smith', dateOfBirth: new Date('1985-05-15'), bio: '' },
    ]);
  });

  afterAll(async () => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
      await queryRunner.query('TRUNCATE TABLE `author`');
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
      await AppDataSource.destroy();
    }
  });

  describe('getAuthors', () => {
    it('should return all authors sorted by fullname ASC', async () => {
      const result = await authorService.getAuthors();
      expect(result.length).toEqual(2);
      expect(result[0]).toBeInstanceOf(Author);
      expect(result[0].fullname).toEqual('Jane Smith');
      expect(result[0].dateOfBirth).toEqual(new Date('1985-05-15'));
    });

    it('should return all authors sorted by fullname DESC', async () => {
      const result = await authorService.getAuthors('fullname', 'DESC');
      expect(result.length).toEqual(2);
      expect(result[0]).toBeInstanceOf(Author);
      expect(result[0].fullname).toEqual('John Doe');
    });
  });

  describe('getAuthorByFullName', () => {
    it('should return author by full name', async () => {
      const author = await authorRepository.save({
        fullname: 'Unique Author',
        dateOfBirth: new Date('1975-01-01'),
        bio: '',
      });

      const result = await authorService.getAuthorByFullName('Unique Author');

      if (result) {
        expect(result).toBeInstanceOf(Author);
        expect(result.fullname).toEqual('Unique Author');
      } else {
        fail('Expected author to be returned but got null');
      }
    });

    it('should return null if author not found by full name', async () => {
      const result =
        await authorService.getAuthorByFullName('Nonexistent Author');
      expect(result).toBeNull();
    });
  });

  describe('getAuthorsPage', () => {
    it('should return paginated authors and meta information', async () => {
      const result = await authorService.getAuthorsPage(1, 1);
      expect(result.authors.length).toEqual(1);
      expect(result.authors[0]).toBeInstanceOf(Author);
      expect(result.total).toEqual(3);
    });

    it('should return paginated authors matching keyword', async () => {
      const result = await authorService.getAuthorsPage(
        1,
        10,
        'fullname',
        'ASC',
        'John'
      );
      expect(result.authors.length).toEqual(1);
      expect(result.authors[0]).toBeInstanceOf(Author);
      expect(result.authors[0].fullname).toEqual('John Doe');
      expect(result.total).toEqual(1);
    });

    it('should return an empty list if page number is invalid', async () => {
      const result = await authorService.getAuthorsPage(-1, 10);
      expect(result.authors.length).toEqual(0);
      expect(result.total).toEqual(3);
    });

    it('should return an empty list if no authors match the query', async () => {
      const result = await authorService.getAuthorsPage(
        1,
        10,
        'fullname',
        'ASC',
        'Nonexistent'
      );
      expect(result.authors.length).toEqual(0);
      expect(result.total).toEqual(0);
    });

    it('should handle pageSize being extremely large', async () => {
      const result = await authorService.getAuthorsPage(1, 10000);
      expect(result.authors.length).toBeLessThanOrEqual(3);
      expect(result.total).toEqual(3);
    });
  });

  describe('getAuthorById', () => {
    it('should return Author if id is valid', async () => {
      const author = await authorRepository.findOne({
        where: { fullname: 'John Doe' },
      });
      if (author) {
        const result = await authorService.getAuthorById(
          author.id,
          mockTFunction
        );
        expect(result).toBeInstanceOf(Author);
        if (result instanceof Author) {
          expect(result.id).toBe(author.id);
        }
      }
    });

    it('should return null if author is not found', async () => {
      const result = await authorService.getAuthorById(10000, mockTFunction);
      expect(result).toBeNull();
    });
  });

  describe('createAuthor', () => {
    it('should create a new author successfully', async () => {
      const newAuthor = {
        fullname: 'Alice Walker',
        dateOfBirth: new Date('1965-01-01'),
        bio: 'Author bio',
      };
      const result = await authorService.createAuthor(newAuthor, mockTFunction);
      expect(result).toBeInstanceOf(Author);
      expect(result.fullname).toEqual('Alice Walker');
    });

    it('should throw an error if required fields are missing', async () => {
      try {
        await authorService.createAuthor({}, mockTFunction);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toBe('error.requiredFieldsMissing');
      }
    });

    it('should throw an error if author already exists', async () => {
      try {
        await authorService.createAuthor(
          { fullname: 'John Doe' },
          mockTFunction
        );
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toBe('error.authorAlreadyExists');
      }
    });

    it('should throw an error if author creation fails unexpectedly', async () => {
      const createOptions = {
        fullname: 'Michael Brown',
      };

      jest.spyOn(authorRepository, 'save').mockImplementationOnce(() => {
        throw new Error('Some database error');
      });

      try {
        await authorService.createAuthor(createOptions, mockTFunction);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toBe('error.failedToCreateAuthor');
      }
    });

    it('should handle invalid dateOfBirth type gracefully', async () => {
      try {
        await authorService.createAuthor(
          {
            fullname: 'Invalid Author',
            dateOfBirth: new Date('not-a-date'),
          } as Partial<Author>,
          mockTFunction
        );
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toBe('error.failedToCreateAuthor');
      }
    });

    it('should throw an error if dateOfBirth is invalid', async () => {
      try {
        await authorService.createAuthor(
          {
            fullname: 'Invalid Date Author',
            dateOfBirth: 'not-a-date' as unknown as Date,
          } as Partial<Author>,
          mockTFunction
        );
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toBe('error.failedToCreateAuthor');
      }
    });
  });

  describe('updateAuthor', () => {
    it('should update author data and return Author', async () => {
      const author = await authorRepository.findOne({
        where: { fullname: 'Emily Johnson' },
      });
      if (author !== null) {
        const updateOptions = {
          fullname: 'Emily J. Johnson',
        };
        const result = await authorService.updateAuthor(
          author.id,
          updateOptions,
          mockTFunction
        );
        expect(result).toBeInstanceOf(Author);
        expect(result.fullname).toEqual('Emily J. Johnson');
      }
    });

    it('should throw an error if author is not found', async () => {
      try {
        await authorService.updateAuthor(
          10000,
          { fullname: 'New Author' },
          mockTFunction
        );
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toBe('error.failedToUpdateAuthor');
      }
    });

    it('should throw an error if update fails due to invalid data', async () => {
      const author = await authorRepository.findOne({
        where: { fullname: 'John Doe' },
      });
      if (author) {
        await expect(
          authorService.updateAuthor(author.id, { fullname: '' }, mockTFunction)
        ).rejects.toThrow('error.failedToUpdateAuthor');
      } else {
        fail('No author found for testing');
      }
    });

    it('should throw an error if updating author with invalid ID', async () => {
      try {
        await authorService.updateAuthor(
          99999,
          { fullname: 'New Name' },
          mockTFunction
        );
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toBe('error.failedToUpdateAuthor');
      }
    });
  });

  describe('deleteAuthor', () => {
    it('should delete author', async () => {
      const authorToDelete = await authorRepository.findOne({
        where: { fullname: 'Emily J. Johnson' },
      });
      if (authorToDelete !== null) {
        await authorService.deleteAuthor(authorToDelete.id, mockTFunction);
        const author = await authorRepository.findOne({
          where: { fullname: 'Emily J. Johnson' },
        });
        expect(author).toBeNull();
      }
    });

    it('should throw an error if author is not found', async () => {
      try {
        await authorService.deleteAuthor(10000, mockTFunction);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toBe('error.failedToDeleteAuthor');
      }
    });

    it('should handle trying to delete a non-existent author', async () => {
      try {
        await authorService.deleteAuthor(99999, mockTFunction);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toBe('error.failedToDeleteAuthor');
      }
    });
  });

  describe('searchAuthors', () => {
    it('should return authors matching the query', async () => {
      await authorRepository.save({
        fullname: 'John Doe',
        dateOfBirth: new Date('1990-01-01'),
        avatar: 'default-avatar.png',
        bio: 'Author bio',
      });

      const result = await authorService.searchAuthors('John');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBeInstanceOf(Author);
      expect(result[0].fullname).toEqual('John Doe');
    });

    it('should return all authors if search query is empty', async () => {
      const result = await authorService.searchAuthors('');
      expect(result.length).toEqual(5);
    });

    it('should return authors matching query with special characters', async () => {
      await authorRepository.insert({
        fullname: 'Special & Character',
        dateOfBirth: new Date('1990-01-01'),
        bio: '',
      });
      const result = await authorService.searchAuthors('Special & Character');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].fullname).toEqual('Special & Character');
    });

    it('should return authors with exact match in search query', async () => {
      const result = await authorService.searchAuthors('John Doe');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].fullname).toEqual('John Doe');
    });

    it('should return authors with special characters in search query', async () => {
      const specialCharAuthor = {
        fullname: 'Special @ Author',
        dateOfBirth: new Date('1980-01-01'),
        bio: '',
      };
      await authorRepository.save(specialCharAuthor);

      const result = await authorService.searchAuthors('Special @ Author');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].fullname).toEqual('Special @ Author');
    });

    it('should return authors matching query case-insensitively', async () => {
      await authorRepository.save({
        fullname: 'Case Insensitive Test',
        dateOfBirth: new Date('1980-01-01'),
        bio: '',
      });
      const result = await authorService.searchAuthors('case insensitive test');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].fullname).toEqual('Case Insensitive Test');
    });
  });
});

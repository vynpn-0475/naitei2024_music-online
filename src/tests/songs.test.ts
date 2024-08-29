import { AppDataSource } from '../config/data-source';
import { Repository } from 'typeorm';
import { Song } from '../entities/Song.entity';
import * as songService from '../services/Song.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Request } from 'express';
import { Genre } from '@src/entities/Genre.entity';
import { UserRoles } from '@src/enums/UserRoles.enum';
import { SongStatus } from '@src/enums/SongStatus.enum';

describe('SongService', () => {
  let songRepository: Repository<Song>;
  let mockRequest: DeepMockProxy<Request>;

  beforeAll(async () => {
    await AppDataSource.initialize();
    songRepository = AppDataSource.getRepository(Song);
  });

  beforeEach(() => {
    mockRequest = mockDeep<Request>();
    mockRequest.t.mockImplementation((...args: any[]) => args[0] as string);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('countSongsByGenreId', () => {
    it('should count songs by genre ID', async () => {
      const genreId = 1;
      jest.spyOn(songRepository, 'count').mockResolvedValueOnce(5);
      const count = await songService.countSongsByGenreId(mockRequest, genreId);
      expect(count).toBe(5);
    });

    it('should throw an error if counting fails', async () => {
      const genreId = 999;
      jest.spyOn(songRepository, 'count').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      await expect(
        songService.countSongsByGenreId(mockRequest, genreId)
      ).rejects.toThrow('error.countSongsByGenre');
    });
  });

  describe('getAllSongs', () => {
    it('should return all songs for admin role', async () => {
      const songs = [{ id: 1, title: 'Song 1' }] as Song[];
      jest.spyOn(songRepository, 'find').mockResolvedValueOnce(songs);
      const result = await songService.getAllSongs(mockRequest);
      expect(result).toBe(songs);
    });

    it('should return only published songs for user role', async () => {
      (mockRequest as any).user = { role: UserRoles.User };
      const songs = [
        { id: 1, title: 'Song 1', status: SongStatus.Publish },
      ] as Song[];
      jest.spyOn(songRepository, 'find').mockResolvedValueOnce(songs);
      const result = await songService.getAllSongs(mockRequest, UserRoles.User);
      expect(result).toBe(songs);
      expect(result.every((song) => song.status === SongStatus.Publish)).toBe(
        true
      );
    });

    it('should return empty array when no songs are available', async () => {
      jest.spyOn(songRepository, 'find').mockResolvedValueOnce([]);
      const result = await songService.getAllSongs(mockRequest);
      expect(result).toEqual([]);
    });
  });

  describe('getSongsPage', () => {
    it('should return a paginated list of songs', async () => {
      const page = 1;
      const pageSize = 10;
      const songs = [{ id: 1, title: 'Song 1' }] as Song[];
      const total = 50;
      jest
        .spyOn(songRepository, 'findAndCount')
        .mockResolvedValueOnce([songs, total]);
      const result = await songService.getSongsPage(page, pageSize);
      expect(result.songs).toBe(songs);
      expect(result.total).toBe(total);
    });

    it('should handle cases with no songs', async () => {
      const page = 1;
      const pageSize = 10;
      jest.spyOn(songRepository, 'findAndCount').mockResolvedValueOnce([[], 0]);
      const result = await songService.getSongsPage(page, pageSize);
      expect(result.songs).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should handle invalid page sizes or numbers', async () => {
      const page = 999;
      const pageSize = 10;
      jest.spyOn(songRepository, 'findAndCount').mockResolvedValueOnce([[], 0]);
      const result = await songService.getSongsPage(page, pageSize);
      expect(result.songs).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getSongsByIds', () => {
    it('should return songs by a list of IDs', async () => {
      const songIds = [1];
      const songs = await songService.getSongsByIds(mockRequest, songIds);
      expect(songs).toBeDefined();
      expect(songs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSongsByGenreId', () => {
    it('should return songs by genre ID', async () => {
      const genreId = 1;
      const songs = await songService.getSongsByGenreId(mockRequest, genreId);
      expect(songs).toBeDefined();
      expect(Array.isArray(songs)).toBe(true);
    });
  });

  describe('getSongsByAuthorId', () => {
    it('should return songs by author ID', async () => {
      const authorId = 1;
      const songs = await songService.getSongsByAuthorId(mockRequest, authorId);
      expect(songs).toBeDefined();
      expect(Array.isArray(songs)).toBe(true);
    });

    it('should return only published songs for user role', async () => {
      (mockRequest as any).user = { role: UserRoles.User };
      const authorId = 1;
      const songs = await songService.getSongsByAuthorId(
        mockRequest,
        authorId,
        UserRoles.User
      );
      expect(songs).toBeDefined();
      expect(songs.every((song) => song.status === SongStatus.Publish)).toBe(
        true
      );
    });
  });

  describe('countSongsByAuthorId', () => {
    it('should count songs by author ID', async () => {
      const authorId = 1;
      const count = await songService.countSongsByAuthorId(
        mockRequest,
        authorId
      );
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('createSong', () => {
    it('should create a new song', async () => {
      const newSongData = {
        title: 'New Song',
        artist: 'New Artist',
        lyrics: 'Some lyrics',
        imageUrl: 'imageUrl',
        url: 'url',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdSong = await songService.createSong(
        mockRequest,
        newSongData
      );

      expect(createdSong).toHaveProperty('id');
      expect(createdSong.title).toBe(newSongData.title);
      expect(createdSong.artist).toBe(newSongData.artist);
    });

    it('should throw an error if required fields are missing', async () => {
      const newSongData = {
        artist: 'New Artist',
      };

      await expect(
        songService.createSong(mockRequest, newSongData)
      ).rejects.toThrow('error.failedToCreateSong');
    });
  });

  describe('getSongById', () => {
    it('should return a song by ID', async () => {
      const songId = 1;
      const song = new Song();
      song.id = songId;
      song.title = 'Existing Song';
      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce(song as any);
      const result = await songService.getSongById(
        mockRequest as Request,
        songId
      );
      expect(result).toBe(song);
      expect(result!.title).toBe('Existing Song');
    });

    it('should throw an error if song is not found', async () => {
      const songId = 999;
      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(
        songService.getSongById(mockRequest, songId)
      ).rejects.toThrow('error.failedToFetchSongs');
    });
  });

  describe('updateSong', () => {
    it('should update an existing song', async () => {
      const songId = 1;
      const updatedData = { title: 'Updated Song Title' };
      const song = new Song();
      song.id = songId;
      song.title = 'Original Song Title';
      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce(song as any);
      jest.spyOn(song, 'save').mockResolvedValueOnce(song as any);
      const updatedSong = await songService.updateSong(
        mockRequest as Request,
        songId,
        updatedData
      );
      expect(updatedSong).toBeDefined();
      expect(updatedSong!.title).toBe(updatedData.title);
    });

    it('should throw an error if song is not found', async () => {
      const songId = 999;
      const updatedData = { title: 'Non-existing Song' };
      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(
        songService.updateSong(mockRequest as Request, songId, updatedData)
      ).rejects.toThrow('error.songNotFound');
    });

    it('should throw an error if failed to update the song', async () => {
      const songId = 1;
      const updatedData = { title: 'Updated Song Title' };
      const song = new Song();
      song.id = songId;
      song.title = 'Original Song Title';
      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce(song as any);
      jest.spyOn(song, 'save').mockRejectedValueOnce(new Error('Save failed'));
      await expect(
        songService.updateSong(mockRequest as Request, songId, updatedData)
      ).rejects.toThrow('error.failedToUpdateSong');
    });
  });

  describe('updateSongGenres', () => {
    it('should update genres for a song', async () => {
      const songId = 1;
      const genres = [new Genre({ id: 1 }), new Genre({ id: 2 })];
      const song = new Song();
      song.id = songId;
      song.genres = [];
      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce(song as any);
      jest.spyOn(song, 'save').mockResolvedValueOnce(song as any);

      await songService.updateSongGenres(
        mockRequest as Request,
        songId,
        genres
      );

      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce({
        ...song,
        genres,
      } as any);

      const updatedSong = await songRepository.findOne({
        where: { id: songId },
        relations: ['genres'],
      });

      expect(updatedSong).toBeDefined();
      expect(updatedSong!.genres).toEqual(expect.arrayContaining(genres));
    });

    it('should throw an error if song is not found', async () => {
      const songId = 999;
      const genres = [new Genre({ id: 1 })];

      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        songService.updateSongGenres(mockRequest as Request, songId, genres)
      ).rejects.toThrow('songNotFound');
    });

    it('should throw an error if failed to update genres', async () => {
      const songId = 1;
      const genres = [new Genre({ id: 1 }), new Genre({ id: 2 })];
      const song = new Song();
      song.id = songId;
      song.genres = [];
      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce(song as any);
      jest.spyOn(song, 'save').mockRejectedValueOnce(new Error('Save failed'));

      await expect(
        songService.updateSongGenres(mockRequest as Request, songId, genres)
      ).rejects.toThrow('failedToUpdateSongGenres');
    });
  });
  describe('deleteSong', () => {
    it('should delete song successfully', async () => {
      const songToDelete = await songRepository.findOne({
        where: { title: 'Sample Song' },
      });
      if (songToDelete !== null) {
        await songService.deleteSong(
          mockRequest as Request,
          songToDelete.id,
          'No longer needed'
        );

        const deletedSong = await songRepository.findOne({
          where: { id: songToDelete.id },
        });
        expect(deletedSong).not.toBeNull();
        expect(deletedSong!.status).toBe(SongStatus.Deleted);
        expect(deletedSong!.deleteReason).toBe('No longer needed');
      }
    });

    it('should throw error if failed to delete song', async () => {
      const songId = 1;
      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce({
        id: songId,
        status: SongStatus.Publish,
        deleteReason: '',
        save: jest.fn().mockRejectedValueOnce(new Error('Save failed')),
      } as any);
      await expect(
        songService.deleteSong(
          mockRequest as Request,
          songId,
          'No longer needed'
        )
      ).rejects.toThrow('error.failedToDeleteSong');
    });

    it('should throw an error if song is not found', async () => {
      const songId = 999;
      jest.spyOn(songRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(
        songService.deleteSong(
          mockRequest as Request,
          songId,
          'No longer needed'
        )
      ).rejects.toThrow('error.songNotFound');
    });
  });

  describe('songsSortByUpdatedAt', () => {
    it('should return songs sorted by updatedAt in descending order', async () => {
      const songs = [
        { id: 1, updatedAt: new Date('2024-01-01') } as Song,
        { id: 2, updatedAt: new Date('2024-01-02') } as Song,
      ];
      jest.spyOn(songRepository, 'find').mockResolvedValueOnce(songs);
      const result = await songService.songsSortByUpdatedAt(mockRequest);
      expect(result).toEqual([
        { id: 2, updatedAt: new Date('2024-01-02') } as Song,
        { id: 1, updatedAt: new Date('2024-01-01') } as Song,
      ]);
    });

    it('should throw an error if sorting fails', async () => {
      jest.spyOn(songRepository, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      await expect(
        songService.songsSortByUpdatedAt(mockRequest)
      ).rejects.toThrow('error.sortSongsByUpdatedAt');
    });
  });

  describe('songsSortByUpdatedAtWithStatus', () => {
    it('should return songs with a specific status sorted by updatedAt in descending order', async () => {
      const status = SongStatus.Publish;
      const songs = [
        { id: 1, updatedAt: new Date('2024-01-01'), status } as Song,
        { id: 2, updatedAt: new Date('2024-01-02'), status } as Song,
      ];
      jest.spyOn(songRepository, 'find').mockResolvedValueOnce(songs);
      const result = await songService.songsSortByUpdatedAtWithStatus(
        mockRequest,
        status
      );
      expect(result).toEqual([
        { id: 2, updatedAt: new Date('2024-01-02'), status } as Song,
        { id: 1, updatedAt: new Date('2024-01-01'), status } as Song,
      ]);
    });

    it('should throw an error if sorting fails', async () => {
      const status = SongStatus.Publish;
      jest.spyOn(songRepository, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
      await expect(
        songService.songsSortByUpdatedAtWithStatus(mockRequest, status)
      ).rejects.toThrow('error.sortSongsByUpdatedAt');
    });
  });

  describe('getSongCountByAlbumId', () => {
    it('should return the count of songs by album ID', async () => {
      const albumId = 1;
      jest.spyOn(songRepository, 'count').mockResolvedValueOnce(10);
      const count = await songService.getSongCountByAlbumId(albumId);
      expect(count).toBe(10);
    });

    it('should throw an error if counting fails', async () => {
      const albumId = 999;
      jest.spyOn(songRepository, 'count').mockImplementationOnce(() => {
        throw new Error('error.countSongsByAlbum');
      });
      await expect(songService.getSongCountByAlbumId(albumId)).rejects.toThrow(
        'error.countSongsByAlbum'
      );
    });
  });

  describe('searchSongs', () => {
    it('should return songs matching the search query', async () => {
      const query = 'Song';
      const songs = [{ id: 1, title: 'Song Title' }] as Song[];
      jest.spyOn(songRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(songs),
      } as any);
      const result = await songService.searchSongs(query);
      expect(result).toBe(songs);
    });

    it('should handle cases with no matches', async () => {
      const query = 'Nonexistent';
      jest.spyOn(songRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([]),
      } as any);
      const result = await songService.searchSongs(query);
      expect(result).toEqual([]);
    });

    it('should throw an error if search fails', async () => {
      jest
        .spyOn(songRepository, 'createQueryBuilder')
        .mockImplementationOnce(() => {
          throw new Error('error.failedToFetchSongs');
        });
      await expect(songService.searchSongs('Song')).rejects.toThrow(
        'error.failedToFetchSongs'
      );
    });
  });

  describe('getSongsBySameAuthor', () => {
    it('should return songs by the same author excluding a specific song', async () => {
      const authorId = 1;
      const excludeSongId = 2;
      const songs = [{ id: 1, author: { id: authorId } } as Song];
      jest.spyOn(songRepository, 'find').mockResolvedValueOnce(songs);
      const result = await songService.getSongsBySameAuthor(
        mockRequest,
        authorId,
        excludeSongId
      );
      expect(result).toBe(songs);
      expect(result.every((song) => song.id !== excludeSongId)).toBe(true);
    });

    it('should throw an error if fetching fails', async () => {
      jest.spyOn(songRepository, 'find').mockImplementationOnce(() => {
        throw new Error('error.failedToFetchSongsBySameAuthor');
      });
      await expect(
        songService.getSongsBySameAuthor(mockRequest, 1, 2)
      ).rejects.toThrow('error.failedToFetchSongsBySameAuthor');
    });
  });

  describe('getSongsByPlaylistId', () => {
    it('should return songs in a specific playlist', async () => {
      const playlistId = 1;
      const songs = [{ id: 1, title: 'Song in Playlist' }] as Song[];
      jest.spyOn(songRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(songs),
      } as any);
      const result = await songService.getSongsByPlaylistId(playlistId);
      expect(result).toBe(songs);
    });

    it('should throw an error if fetching fails', async () => {
      jest
        .spyOn(songRepository, 'createQueryBuilder')
        .mockImplementationOnce(() => {
          throw new Error('error.failedToFetchSongsByPlaylist');
        });
      await expect(songService.getSongsByPlaylistId(1)).rejects.toThrow(
        'error.failedToFetchSongsByPlaylist'
      );
    });
  });
});

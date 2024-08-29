import { AppDataSource } from '../config/data-source';
import { Repository } from 'typeorm';
import { Playlist } from '../entities/Playlist.entity';
import * as playlistService from '../services/Playlist.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Request } from 'express';
import { Song } from '@src/entities/Song.entity';
import { PlaylistTypes } from '@src/enums/PlaylistTypes.enum';
import userService from '@src/services/user.service';
import { User } from '@src/entities/User.entity';
import { UserRoles, UserStatus } from '@src/enums/UserRoles.enum';

type GetSongByIdType = (req: Request, songId: number) => Promise<Song | null>;

jest.mock('@src/services/Song.service', () => ({
  getSongById: jest.fn() as jest.MockedFunction<GetSongByIdType>,
}));

const { getSongById } = require('@src/services/Song.service') as {
  getSongById: jest.MockedFunction<GetSongByIdType>;
};

describe('PlaylistService', () => {
  let playlistRepository: Repository<Playlist>;
  let mockRequest: DeepMockProxy<Request>;

  beforeAll(async () => {
    await AppDataSource.initialize();
    playlistRepository = AppDataSource.getRepository(Playlist);
  });

  beforeEach(() => {
    mockRequest = mockDeep<Request>();
    mockRequest.t.mockImplementation((...args: any[]) => args[0] as string);
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'hashedpassword',
    dateOfBirth: new Date('2000-01-01'),
    role: UserRoles.User,
    status: UserStatus.Active,
    createdAt: new Date(),
    updatedAt: new Date(),
    playlists: [],
    favoriteSongs: [],
    comments: [],
    suggestedSongs: [],
    save: jest.fn().mockResolvedValue(this),
    remove: jest.fn().mockResolvedValue(this),
    softRemove: jest.fn().mockResolvedValue(this),
    hasId: jest.fn().mockReturnValue(true),
  } as unknown as User;

  jest.mock('@src/services/user.service', () => ({
    findByUsername: jest.fn().mockResolvedValue(mockUser),
  }));

  describe('getPlaylistsPage', () => {
    it('should return playlists with pagination and sorting', async () => {
      const page = 1;
      const pageSize = 6;
      const sortField: keyof Playlist = 'title';
      const sortOrder: 'ASC' | 'DESC' = 'ASC';
      const query = 'test';

      const playlists = [
        { id: 1, title: 'Test Playlist 1' },
        { id: 2, title: 'Test Playlist 2' },
      ] as Playlist[];
      const total = playlists.length;

      jest
        .spyOn(playlistRepository, 'findAndCount')
        .mockResolvedValueOnce([playlists, total]);

      const result = await playlistService.getPlaylistsPage(
        page,
        pageSize,
        undefined,
        undefined,
        false,
        sortField,
        sortOrder,
        query
      );

      expect(result.playlists).toEqual(playlists);
      expect(result.total).toBe(total);
    });

    it('should return empty playlists when no matching playlists are found', async () => {
      jest
        .spyOn(playlistRepository, 'findAndCount')
        .mockResolvedValueOnce([[], 0]);

      const result = await playlistService.getPlaylistsPage(1, 6);

      expect(result.playlists).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('searchPlaylists', () => {
    it('should return playlists matching the search query', async () => {
      const query = 'test';
      const playlists = [
        { id: 1, title: 'Test Playlist 1' },
        { id: 2, title: 'Test Playlist 2' },
      ] as Playlist[];

      jest.spyOn(playlistRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(playlists),
      } as any);

      const result = await playlistService.searchPlaylists(query);

      expect(result).toEqual(playlists);
    });

    it('should return an empty array when no playlists match the search query', async () => {
      const query = 'nonexistent';
      jest.spyOn(playlistRepository, 'createQueryBuilder').mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([]),
      } as any);

      const result = await playlistService.searchPlaylists(query);

      expect(result).toEqual([]);
    });
  });

  describe('getPlaylistByUserId', () => {
    it('should return playlists for a given user ID', async () => {
      const userId = 1;
      const playlists = [
        { id: 1, title: 'User Playlist 1' },
        { id: 2, title: 'User Playlist 2' },
      ] as Playlist[];

      jest.spyOn(playlistRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce(playlists),
      } as any);

      const result = await playlistService.getPlaylistByUserId(userId);

      expect(result).toEqual(playlists);
    });

    it('should return an empty array when no playlists are found for the user ID', async () => {
      const userId = 1;
      jest.spyOn(playlistRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValueOnce([]),
      } as any);

      const result = await playlistService.getPlaylistByUserId(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getPlaylistByUserIdAndTitle', () => {
    it('should return a playlist matching the user ID and title', async () => {
      const userId = 1;
      const playlistTitle = 'User Playlist 1';
      const playlist = { id: 1, title: playlistTitle } as Playlist;

      jest.spyOn(playlistRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(playlist),
      } as any);

      const result = await playlistService.getPlaylistByUserIdAndTitle(
        userId,
        playlistTitle
      );

      expect(result).toEqual(playlist);
    });

    it('should return null when no playlist matches the user ID and title', async () => {
      const userId = 1;
      const playlistTitle = 'Nonexistent Playlist';
      jest.spyOn(playlistRepository, 'createQueryBuilder').mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await playlistService.getPlaylistByUserIdAndTitle(
        userId,
        playlistTitle
      );

      expect(result).toBeNull();
    });
  });

  describe('createPlaylist', () => {
    it('should create a new playlist', async () => {
      const newPlaylistData = {
        title: 'New Playlist',
        createdAt: new Date(),
        type: PlaylistTypes.System,
      };

      jest.spyOn(playlistRepository, 'save').mockResolvedValueOnce({
        id: 1,
        ...newPlaylistData,
      } as any);

      const createdPlaylist = await playlistService.createPlaylist(
        mockRequest,
        newPlaylistData
      );

      expect(createdPlaylist.title).toBe(newPlaylistData.title);
    });

    it('should throw an error if required fields are missing', async () => {
      const newPlaylistData = { title: 'New Playlist' };

      await expect(
        playlistService.createPlaylist(mockRequest, newPlaylistData)
      ).rejects.toThrow('error.failedToCreatePlaylist');
    });

    it('should assign playlist to user if role is User', async () => {
      const newPlaylistData = {
        title: 'User Playlist',
        createdAt: new Date(),
      };
      const username = 'testuser';

      jest.spyOn(userService, 'findByUsername').mockResolvedValueOnce(mockUser);
      jest.spyOn(playlistRepository, 'save').mockResolvedValueOnce({
        id: 1,
        ...newPlaylistData,
      } as any);
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(mockUser, 'save').mockResolvedValueOnce(mockUser);

      const createdPlaylist = await playlistService.createPlaylist(
        mockRequest,
        newPlaylistData,
        UserRoles.User,
        username
      );

      expect(createdPlaylist.title).toBe(newPlaylistData.title);
      expect(mockUser.playlists).toContainEqual(createdPlaylist);
    });
  });

  describe('getAllPlaylistByUser', () => {
    it('should return all playlists', async () => {
      const playlists = [{ id: 1, title: 'Playlist 1' }] as Playlist[];
      jest.spyOn(playlistRepository, 'find').mockResolvedValueOnce(playlists);
      const result = await playlistService.getAllPlaylistByUser(mockRequest);
      expect(result).toBe(playlists);
    });

    it('should return an empty array when no playlists are available', async () => {
      jest.spyOn(playlistRepository, 'find').mockResolvedValueOnce([]);
      const result = await playlistService.getAllPlaylistByUser(mockRequest);
      expect(result).toEqual([]);
    });
  });

  describe('getPlaylistById', () => {
    it('should return a playlist by ID', async () => {
      const playlistId = 1;
      const playlist = new Playlist();
      playlist.id = playlistId;
      playlist.title = 'Existing Playlist';
      jest
        .spyOn(playlistRepository, 'findOne')
        .mockResolvedValueOnce(playlist as any);
      const result = await playlistService.getPlaylistById(
        playlistId,
        mockRequest
      );
      expect(result).toBe(playlist);
      expect(result!.title).toBe('Existing Playlist');
    });

    it('should throw an error if playlist is not found', async () => {
      const playlistId = 999;
      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(
        playlistService.getPlaylistById(playlistId, mockRequest)
      ).rejects.toThrow('error.playlistNotFound');
    });
  });

  describe('updatePlaylist', () => {
    it('should update an existing playlist', async () => {
      const playlistId = 1;
      const updatedData = { title: 'Updated Playlist title' };
      const playlist = new Playlist();
      playlist.id = playlistId;
      playlist.title = 'Original Playlist title';
      jest
        .spyOn(playlistRepository, 'findOne')
        .mockResolvedValueOnce(playlist as any);
      jest
        .spyOn(playlistRepository, 'save')
        .mockResolvedValueOnce(playlist as any);
      const updatedPlaylist = await playlistService.updatePlaylist(
        mockRequest,
        playlistId,
        updatedData
      );
      expect(updatedPlaylist).toBeDefined();
      expect(updatedPlaylist!.title).toBe(updatedData.title);
    });

    it('should throw an error if playlist is not found', async () => {
      const playlistId = 999;
      const updatedData = { title: 'Non-existing Playlist' };
      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(
        playlistService.updatePlaylist(mockRequest, playlistId, updatedData)
      ).rejects.toThrow('error.playlistNotFound');
    });

    it('should throw an error if failed to update the playlist', async () => {
      const playlistId = 1;
      const updatedData = { title: 'Updated Playlist title' };
      const playlist = new Playlist();
      playlist.id = playlistId;
      playlist.title = 'Original Playlist title';
      jest
        .spyOn(playlistRepository, 'findOne')
        .mockResolvedValueOnce(playlist as any);
      jest
        .spyOn(playlistRepository, 'save')
        .mockRejectedValueOnce(new Error('Save failed'));
      await expect(
        playlistService.updatePlaylist(mockRequest, playlistId, updatedData)
      ).rejects.toThrow('error.failedToUpdatePlaylist');
    });
  });

  describe('deletePlaylist', () => {
    it('should delete a playlist successfully', async () => {
      const playlistId = 1;
      const playlistToDelete = new Playlist();
      playlistToDelete.id = playlistId;
      jest
        .spyOn(playlistRepository, 'findOne')
        .mockResolvedValueOnce(playlistToDelete as any);
      jest
        .spyOn(playlistRepository, 'remove')
        .mockResolvedValueOnce(playlistToDelete as any);

      await playlistService.deletePlaylist(mockRequest, playlistId);

      const deletedPlaylist = await playlistRepository.findOne({
        where: { id: playlistId },
      });
      expect(deletedPlaylist).toBeNull();
    });

    it('should throw an error if playlist is not found', async () => {
      const playlistId = 999;
      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(
        playlistService.deletePlaylist(mockRequest, playlistId)
      ).rejects.toThrow('error.playlistNotFound');
    });

    it('should throw an error if failed to delete playlist', async () => {
      const playlistId = 1;
      jest
        .spyOn(playlistRepository, 'findOne')
        .mockResolvedValueOnce({ id: playlistId } as any);
      jest
        .spyOn(playlistRepository, 'remove')
        .mockRejectedValueOnce(new Error('Delete failed'));
      await expect(
        playlistService.deletePlaylist(mockRequest, playlistId)
      ).rejects.toThrow('error.failedToDeletePlaylist');
    });
  });
  describe('addSongToPlaylist', () => {
    it('should add a song to a playlist', async () => {
      const playlistId = 1;
      const songId = 1;
      const playlist = new Playlist();
      playlist.id = playlistId;
      playlist.songs = [];

      const song = new Song();
      song.id = songId;

      const updatedPlaylist = {
        ...playlist,
        songs: [...playlist.songs, song],
      } as Playlist;

      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(playlist);
      getSongById.mockResolvedValueOnce(song);
      jest
        .spyOn(playlistRepository, 'save')
        .mockResolvedValueOnce(updatedPlaylist);

      await playlistService.addSongToPlaylist(
        mockRequest as Request,
        playlistId,
        songId
      );

      expect(playlistRepository.save).toHaveBeenCalled();

      const saveCalls = (playlistRepository.save as jest.Mock).mock.calls;

      expect(saveCalls.length).toBeGreaterThan(0);
      expect(saveCalls[0][0]).toMatchObject(updatedPlaylist);

      const savedPlaylist = await playlistRepository.findOne({
        where: { id: playlistId },
        relations: ['songs'],
      });

      expect(savedPlaylist).toBeDefined();
      if (savedPlaylist) {
        expect(savedPlaylist.songs).toContainEqual(song);
      }
    });

    it('should throw an error if song does not exist', async () => {
      const playlistId = 1;
      const songId = 1;
      const playlist = new Playlist();
      playlist.id = playlistId;
      playlist.songs = [];

      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(playlist);
      getSongById.mockResolvedValueOnce(null);

      await expect(
        playlistService.addSongToPlaylist(
          mockRequest as Request,
          playlistId,
          songId
        )
      ).rejects.toThrow('error.songNotFound');
    });

    it('should throw an error if song is already in playlist', async () => {
      const playlistId = 1;
      const songId = 1;
      const song = new Song();
      song.id = songId;
      const playlist = new Playlist();
      playlist.id = playlistId;
      playlist.songs = [song];

      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(playlist);
      getSongById.mockResolvedValueOnce(song);

      await expect(
        playlistService.addSongToPlaylist(
          mockRequest as Request,
          playlistId,
          songId
        )
      ).rejects.toThrow('error.failedToAddPlaylist');
    });

    it('should throw an error if failed to add song to playlist', async () => {
      const playlistId = 1;
      const songId = 1;
      const playlist = new Playlist();
      playlist.id = playlistId;
      playlist.songs = [];

      const song = new Song();
      song.id = songId;

      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(playlist);
      getSongById.mockResolvedValueOnce(song);
      jest
        .spyOn(playlistRepository, 'save')
        .mockRejectedValueOnce(new Error('Save failed'));

      await expect(
        playlistService.addSongToPlaylist(
          mockRequest as Request,
          playlistId,
          songId
        )
      ).rejects.toThrow('error.failedToAddPlaylist');
    });
  });

  describe('removeSongFromPlaylist', () => {
    it('should remove a song from a playlist', async () => {
      const playlistId = 1;
      const songId = 1;

      const playlist = new Playlist();
      playlist.id = playlistId;
      playlist.songs = [{ id: songId } as Song];

      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(playlist);

      jest
        .spyOn(playlistRepository, 'save')
        .mockImplementation(async (updatedPlaylist) => {
          return { ...updatedPlaylist, songs: [] } as Playlist;
        });

      await playlistService.removeSongFromPlaylist(
        mockRequest as Request,
        playlistId,
        songId
      );

      const savedPlaylist = await playlistRepository.findOne({
        where: { id: playlistId },
        relations: ['songs'],
      });

      expect(savedPlaylist).toBeDefined();
    });

    it('should throw an error if playlist does not exist', async () => {
      const playlistId = 999;
      const songId = 1;
      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        playlistService.removeSongFromPlaylist(
          mockRequest as Request,
          playlistId,
          songId
        )
      ).rejects.toThrow('error.failedToRemoveSongPlaylist');
    });

    it('should throw an error if song does not exist in playlist', async () => {
      const playlistId = 1;
      const songId = 1;
      const playlist = new Playlist();
      playlist.id = playlistId;
      playlist.songs = [];

      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(playlist);

      await expect(
        playlistService.removeSongFromPlaylist(
          mockRequest as Request,
          playlistId,
          songId
        )
      ).rejects.toThrow('error.songNotFound');
    });

    it('should throw an error if failed to remove song from playlist', async () => {
      const playlistId = 1;
      const songId = 1;
      const playlist = new Playlist();
      playlist.id = playlistId;
      playlist.songs = [{ id: songId } as Song];

      jest.spyOn(playlistRepository, 'findOne').mockResolvedValueOnce(playlist);
      jest
        .spyOn(playlistRepository, 'save')
        .mockRejectedValueOnce(
          new Error('error.failedToRemoveSongFromPlaylist')
        );

      await expect(
        playlistService.removeSongFromPlaylist(
          mockRequest as Request,
          playlistId,
          songId
        )
      ).rejects.toThrow('error.failedToRemoveSongFromPlaylist');
    });
  });
});

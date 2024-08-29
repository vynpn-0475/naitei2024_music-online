import { searchAll } from '@src/services/Search.service';
import { searchSongs } from '@src/services/Song.service';
import { searchAuthors } from '@src/services/Author.service';
import { searchGenres } from '@src/services/Genre.service';
import { searchPlaylists } from '@src/services/Playlist.service';
import { searchAlbums } from '@src/services/Album.service';

jest.mock('@src/services/Song.service');
jest.mock('@src/services/Author.service');
jest.mock('@src/services/Genre.service');
jest.mock('@src/services/Playlist.service');
jest.mock('@src/services/Album.service');

describe('searchAll', () => {
  it('should call all search services and return their combined results', async () => {
    const query = 'test';
    const mockSongs = [{ id: 1, title: 'Song 1' }];
    const mockAuthors = [{ id: 1, name: 'Author 1' }];
    const mockGenres = [{ id: 1, name: 'Genre 1' }];
    const mockPlaylists = [{ id: 1, title: 'Playlist 1' }];
    const mockAlbums = [{ id: 1, title: 'Album 1' }];

    (searchSongs as jest.Mock).mockResolvedValue(mockSongs);
    (searchAuthors as jest.Mock).mockResolvedValue(mockAuthors);
    (searchGenres as jest.Mock).mockResolvedValue(mockGenres);
    (searchPlaylists as jest.Mock).mockResolvedValue(mockPlaylists);
    (searchAlbums as jest.Mock).mockResolvedValue(mockAlbums);

    const result = await searchAll(query);

    expect(searchSongs).toHaveBeenCalledWith(query, undefined);
    expect(searchAuthors).toHaveBeenCalledWith(query);
    expect(searchGenres).toHaveBeenCalledWith(query);
    expect(searchPlaylists).toHaveBeenCalledWith(query);
    expect(searchAlbums).toHaveBeenCalledWith(query);

    expect(result).toEqual({
      songs: mockSongs,
      authors: mockAuthors,
      genres: mockGenres,
      playlists: mockPlaylists,
      albums: mockAlbums,
    });
  });
});

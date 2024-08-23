import { searchSongs } from '@src/services/Song.service';
import { searchAuthors } from '@src/services/Author.service';
import { searchGenres } from '@src/services/Genre.service';
import { searchPlaylists } from '@src/services/Playlist.service';
import { searchAlbums } from '@src/services/Album.service';

export const searchAll = async (query: string, role?: string) => {
  const [songs, authors, genres, playlists, albums] = await Promise.all([
    searchSongs(query, role),
    searchAuthors(query),
    searchGenres(query),
    searchPlaylists(query),
    searchAlbums(query),
  ]);

  return {
    songs,
    authors,
    genres,
    playlists,
    albums,
  };
};

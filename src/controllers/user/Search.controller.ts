import { Request, Response } from 'express';
import { searchSongs } from '@src/services/Song.service';
import { searchAuthors } from '@src/services/Author.service';
import { searchGenres } from '@src/services/Genre.service';
import { searchPlaylists } from '@src/services/Playlist.service';
import { searchAlbums } from '@src/services/Album.service';
import { Song } from '@src/entities/Song.entity';
import { Author } from '@src/entities/Author.entity';
import { Genre } from '@src/entities/Genre.entity';
import { Playlist } from '@src/entities/Playlist.entity';
import { Album } from '@src/entities/Album.entity';
import { searchAll } from '@src/services/Search.service';

export const search = async (req: Request, res: Response) => {
  const query = (req.query.query as string) || '';
  const type = req.params.type || 'all';
  const user = req.session.user;
  let results: {
    songs?: Song[];
    authors?: Author[];
    genres?: Genre[];
    playlists?: Playlist[];
    albums?: Album[];
  } = {};

  switch (type) {
    case 'songs':
      results.songs = await searchSongs(query, user?.role);
      break;
    case 'artists':
      results.authors = await searchAuthors(query);
      break;
    case 'genres':
      results.genres = await searchGenres(query);
      break;
    case 'playlists':
      results.playlists = await searchPlaylists(query);
      break;
    case 'albums':
      results.albums = await searchAlbums(query);
      break;
    case 'all':
    default:
      results = await searchAll(query, user?.role);
      break;
  }

  res.render('pages/search', { searchResults: results, query, t: req.t });
};

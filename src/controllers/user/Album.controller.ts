import { Request, Response } from 'express';
import { t } from 'i18next';
import {
  getAlbumById,
} from '@src/services/Album.service';
import { getSongCountByAlbumId } from '@src/services/Song.service';

export class AlbumController {
  public static albumDetail = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const album = await getAlbumById(parseInt(id));
      if (!album) {
        req.flash('error_msg', t('error.albumNotFound'));
        return res.redirect('/user/search');
      }
      const songs = album.songs;
      const author = album.author;
      const countSong = await getSongCountByAlbumId(parseInt(id));
      if (countSong === 0) {
        req.flash('error_msg', t('error.songNotFound'));
        return res.render('pages/detail/albums', {
          album,
          songs,
          author,
          countSong,
        });
      }
      return res.render('pages/detail/albums', {
        album,
        songs,
        author,
        countSong,
      });
    } catch (error) {
      req.flash('error_msg', t('error.system'));
      return res.render('error', {
        message: t('error.system'),
        error: { status: 500, stack: error.stack },
      });
    }
  };
}

import { Request, Response } from 'express';
import { t } from 'i18next';
import { getAuthors } from '@src/services/Author.service';
import { uploadImg } from '@src/services/LoadFirebase';
import { createAlbum } from '@src/services/Album.service';

export class AlbumController {
  public static getCreate = async (req: Request, res: Response) => {
    try {
      const authors = await getAuthors();
      res.render('albums/create', {
        authors,
      });
    } catch (error) {
      req.flash('error_msg', t('error.noPageCreate'));
      return res.render('error', {
        message: t('error.noPageCreate'),
        error: { status: 500, stack: error.stack },
      });
    }
  };
  public static postCreate = async (req: Request, res: Response) => {
    const file = req.file;
    let imgUrl: string = '';
    try {
      if (file) {
        const url = await uploadImg(file);
        if (url !== null) {
          imgUrl = url;
        } else {
          imgUrl =
            'https://firebasestorage.googleapis.com/v0/b/musiconline-3cd71.appspot.com/o/images%2Fimg2.jpg?alt=media&token=a7ce37bd-93f8-44e4-bd60-f8098163419b';
        }
      }
      const data = {
        title: req.body.title,
        imageUrl: imgUrl,
        releaseDate: req.body.releaseDate,
        authorId: req.body.authorId,
      };
      const value = await createAlbum(data);
      if (!value) {
        req.flash('error_msg', t('error.createFail'));
        return res.redirect('/admin/lbums/create');
      }
      req.flash('success_msg', t('success.createSuccess'));
      return res.redirect('/admin/albums/create');
    } catch (error) {
      req.flash('error_msg', t('error.noPageCreate'));
      return res.render('error', {
        message: t('error.noPageCreate'),
        error: { status: 500, stack: error.stack },
      });
    }
  };
}

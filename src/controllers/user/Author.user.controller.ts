import { getAuthorById } from '@src/services/Author.service';
import { getSongsByAuthorId } from '@src/services/Song.service';
import { Request, Response } from 'express';

export const detail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.session.user;
  try {
    const author = await getAuthorById(parseInt(id), req.t);

    if (!author) {
      req.flash('error_msg', req.t('error.authorNotFound'));
      return res.redirect('/user');
    }
    const songs = await getSongsByAuthorId(req, author.id);
    res.render('authors/detail.user', {
      user,
      author,
      songs,
      title: req.t('title'),
    });
  } catch (error) {
    req.flash('error_msg', req.t('error.userNotFound'));
    res.redirect('/login');
  }
};

import { getAuthorById } from '@src/services/Author.service';
import { getSongsByAuthorId } from '@src/services/Song.service';
import { NextFunction, Request, Response } from 'express';

export async function validateAndFetchAuthor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = parseInt(req.params.id);
  const t = req.t;

  if (isNaN(id)) {
    req.flash('error_msg', t('error.invalidAuthorId'));
    return res.redirect('/error');
  }

  try {
    const author = await getAuthorById(id, t);
    if (author === null) {
      req.flash('error_msg', t('error.authorNotFound'));
      return res.redirect('/error');
    }
    (req as any).author = author;
    next();
  } catch (error) {
    req.flash('error_msg', t('error.failedToFetchAuthor'));
    return res.redirect('/error');
  }
}

export const authorDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.session.user;
  try {
    const author = await getAuthorById(parseInt(id), req.t);

    if (!author) {
      req.flash('error_msg', req.t('error.authorNotFound'));
      return res.redirect('/user/search');
    }
    const songs = await getSongsByAuthorId(req, author.id, user?.role);
    res.render('pages/detail/authors', {
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

import { getAuthorById } from '@src/services/Author.service';
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

export const authorDetail = (req: Request, res: Response) => {
  const user = req.session.user;

  if (!user) {
    req.flash('error_msg', req.t('error.unauthorized'));
    return res.redirect('/login');
  }
};

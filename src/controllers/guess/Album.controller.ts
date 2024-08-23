import { Request, Response } from 'express';
import { t } from 'i18next';

export class AlbumController {
  public static albumDetail = (req: Request, res: Response) => {
  const user = req.session.user;

    if (!user) {
      req.flash('error_msg', req.t('error.unauthorized'));
      return res.redirect('/login');
    }
  };
}

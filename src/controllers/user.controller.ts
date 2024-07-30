import UserService from '@src/services/user.service';
import { Request, Response } from 'express';
import { t } from 'i18next';
import { UserRoles } from '@src/enums/UserRoles.enum';
import { User } from '@src/entities/User.entity';
import { formatDate, formatDateYMD } from '@src/utils/formatDate';

export class UserController {
  public static getDetail = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      if (!id) {
        req.flash('error_msg', t('message.userNotFound'));
        return res.redirect('/users');
      }
      const user = await UserService.findById(parseInt(id));
      if (!user) {
        return res.render('pages/user/detail_user', {});
      }
      const dateOfBirth = formatDate(user.user_dateOfBirth);
      return res.render('pages/user/detail_user', {
        user,
        dateOfBirth: dateOfBirth,
        pageTitle: t('title_detail') + t('option.user'),
      });
    } catch (error) {
      req.flash('error_msg', t('message.userNotFound'));
      return res.render('error', {
        message: t('message.userNotFound'),
        error: { status: 500, stack: error.stack },
      });
    }
  };
  public static getUpdatePage = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const roles = Object.values(UserRoles);
      const user = await UserService.findById(parseInt(id));
      const dateOfBirth = formatDateYMD(user.user_dateOfBirth);
      return res.render('pages/user/update_user', {
        user,
        dateOfBirth: dateOfBirth,
        pageTitle: t('action.update') + t('option.user'),
        roles,
      });
    } catch (error) {
      req.flash('error_msg', t('message.userNotFound'));
      return res.render('error', {
        message: t('message.userNotFound'),
        error: { status: 500, stack: error.stack },
      });
    }
  };

  public static postUpdate = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userData: Partial<User> = req.body;
    try {
      const success = await UserService.update(parseInt(id), userData);
      if (!success) {
        req.flash('error', t('error.updateFail'));
        return res.redirect(`../../users/update/${id}`);
      }
      return res.redirect(`../../users/${id}`);
    } catch (error) {
      req.flash('error_msg', t('error.updateFail'));
      return res.render('error', {
        message: t('error.updateFail'),
        error: { status: 500, stack: error.stack },
      });
    }
  };
}

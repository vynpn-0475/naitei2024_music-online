import { Request, Response } from 'express';
import { t } from 'i18next';
import userService from '@src/services/user.service';
import { User } from '@src/entities/User.entity';
import { formatDate } from '@src/utils/formatDate';

export class UserController {
  public static getList = async (req: Request, res: Response) => {
    try {
      const users = await userService.findUsers();
      if (!users) {
        return res.render('pages/user/list_user', {});
      }
      // Tạo dữ liệu định dạng để gửi đến view
      const formattedUsers = users.map((user: User) => {
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          dateOfBirth: formatDate(user.dateOfBirth),
        };
      });
      res.render('pages/user/list_user', { users: formattedUsers });
    } catch (error) {
      req.flash('error_msg', 'error.logoutFail');
      res.redirect('../');
    }
  };
  public static getDetail = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      if (!id) {
        req.flash('error_msg', t('message.userNotFound'));
        return res.redirect('/users');
      }
      const user = await userService.findById(parseInt(id));
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
}

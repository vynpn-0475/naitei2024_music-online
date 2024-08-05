import { Change } from '@src/constants/change';
import { User } from '@src/entities/User.entity';
import { UserRoles } from '@src/enums/UserRoles.enum';
import UserService from '@src/services/user.service';
import { formatDate, formatDateYMD } from '@src/utils/formatDate';
import { hashPassword } from '@src/utils/passwordUtils';
import { Request, Response } from 'express';
import { t } from 'i18next';

export const getList = async (req: Request, res: Response) => {
  try {
    const users = await UserService.findUsers();
    if (!users) {
      return res.render('users/list_user', {});
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
    res.render('users/list_user', { users: formattedUsers });
  } catch (error) {
    req.flash('error_msg', t('error.userNotFound'));
    res.redirect('/admin');
  }
};

export const getCreate = (req: Request, res: Response) => {
  try {
    const roles = Object.values(UserRoles);
    return res.render('users/create_user', { roles });
  } catch (error) {
    req.flash('error_msg', t('error.createFail'));
    res.redirect('/admin/users');
  }
};

export const postCreate = async (req: Request, res: Response) => {
  const data = req.body;
  try {
    const user = await UserService.findByUsername(data.username);
    if (user) {
      req.flash('error_msg', t('error.createFail'));
      return res.redirect('/admin/users/create');
    }
    const password = Change.password;
    // Mã hóa mật khẩu trước khi lưu
    const hashedPassword = await hashPassword(password);
    // Thay thế mật khẩu gốc bằng mật khẩu đã mã hóa
    data.password = hashedPassword;
    const isValue = await UserService.create(data);
    if (!isValue) {
      req.flash('error_msg', t('error.createFail'));
      return res.redirect('/admin/users/create');
    }
    req.flash('success_msg', t('success.createSuccess'));
    return res.redirect('/admin/users');
  } catch (error) {
    req.flash('error_msg', t('error.createFail'));
    res.redirect('/error');
  }
};

export const getDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (!id) {
      req.flash('error_msg', t('error.userNotFound'));
      return res.redirect('/admin/users');
    }
    const user = await UserService.findById(parseInt(id));
    if (!user) {
      req.flash('error_msg', t('error.userNotFound'));
      return res.render('users/detail_user', {});
    }
    const dateOfBirth = formatDate(user.user_dateOfBirth);
    return res.render('users/detail_user', {
      user,
      dateOfBirth: dateOfBirth,
      pageTitle: t('title_detail') + t('option.user'),
    });
  } catch (error) {
    req.flash('error_msg', t('error.userNotFound'));
    res.redirect('/error');
  }
};
export const getUpdatePage = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const roles = Object.values(UserRoles);
    const user = await UserService.findById(parseInt(id));
    const dateOfBirth = formatDateYMD(user.user_dateOfBirth);
    return res.render('users/update_user', {
      user,
      dateOfBirth: dateOfBirth,
      pageTitle: t('common.edit') + t('option.user'),
      roles,
    });
  } catch (error) {
    req.flash('error_msg', t('error.userNotFound'));
    res.redirect('/error');
  }
};
export const postUpdate = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userData: Partial<User> = req.body;
  try {
    const success = await UserService.update(parseInt(id), userData);
    if (!success) {
      req.flash('error_msg', t('error.updateFail'));
      return res.redirect(`/admin/users/update/${id}`);
    }
    req.flash('success_msg', t('success.updateSuccess'));
    return res.redirect(`/admin/users/${id}`);
  } catch (error) {
    req.flash('error_msg', t('error.updateFail'));
    res.redirect('/error');
  }
};
export const postDelete = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const success = await UserService.delete(parseInt(id));
    if (!success) {
      req.flash('error_msg', t('error.deleteFail'));
      return res.redirect(`/admin/users/${id}`);
    }
    req.flash('success_msg', t('success.deleteSuccess'));
    return res.redirect('/admin/users');
  } catch (error) {
    req.flash('error_msg', t('error.deleteFail'));
    res.redirect('/error');
  }
};

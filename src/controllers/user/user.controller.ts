import UserService from '@src/services/user.service';
import { Request, Response } from 'express';
import { t } from 'i18next';
import { comparePassword, hashPassword } from '@src/utils/passwordUtils';
import { UserRoles } from '@src/enums/UserRoles.enum';
import { formatDate } from '@src/utils/formatDate';
import { User } from '@src/entities/User.entity';

export class UserController {
  public static getRegister = (req: Request, res: Response) => {
    try {
      res.render('pages/user/register', { pageTitle: t('action.register') });
    } catch (error) {
      req.flash('error_msg', t('error.registerFail'));
      return res.render('error', {
        message: t('error.loginFail'),
        error: { status: 500, stack: error.stack },
      });
    }
  };
  public static getLogin = (req: Request, res: Response) => {
    try {
      res.render('pages/user/login', { pageTitle: t('action.login') });
    } catch (error) {
      req.flash('error_msg', t('noPageLogin'));
      return res.render('error', {
        message: t('error.loginFail'),
        error: { status: 500, stack: error.stack },
      });
    }
  };
  public static checkUsername = async (req: Request, res: Response) => {
    const username = req.body.username;
    try {
      const user = await UserService.findByUsername(username);
      if (user) {
        return res
          .status(400)
          .json({ message: t('error.usernameAlreadyTaken') });
      }
      res.status(200).json({ message: t('message.usernameAvailable') });
    } catch (error) {
      return res.status(404).json({ message: t('error.system') });
    }
  };
  public static postRegister = async (req: Request, res: Response) => {
    const data = req.body;
    const password = req.body.password;
    try {
      const user = await UserService.findByUsername(data.username);
      if (user) {
        req.flash('error_msg', t('error.createFail'));
        return res.redirect('/register');
      }
      // Mã hóa mật khẩu trước khi lưu
      const hashedPassword = await hashPassword(password);
      // Thay thế mật khẩu gốc bằng mật khẩu đã mã hóa
      data.password = hashedPassword;
      data.role = UserRoles.User;
      const isValue = await UserService.create(data);
      if (!isValue) {
        req.flash('error_msg', t('error.createFail'));
        return res.redirect('/register');
      }
      return res.redirect('/login');
    } catch (error) {
      req.flash('error_msg', t('error.createFail'));
      return res.render('error', {
        message: t('error.loginFail'),
        error: { status: 500, stack: error.stack },
      });
    }
  };

  public static postLogin = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
      const user = await UserService.findByUsername(username);
      if (!user) {
        req.flash('error_msg', t('error.invalidCredentials'));
        return res.redirect('/login');
      }

      const isMatch = await comparePassword(password, user.password);

      if (!isMatch) {
        req.flash('error_msg', t('error.invalidCredentials'));
        return res.redirect('/login');
      }

      // Xử lý đăng nhập thành công
      (req.session as any).user = user;
      if (user.role === UserRoles.User) {
        return res.render('pages/home', {
          pageTitle: t('page.home'),
          user: user,
        });
      } else {
        return res.redirect('/admin');
      }
    } catch (error) {
      req.flash('error_msg', t('error.loginFail'));
      return res.render('error', {
        message: t('error.loginFail'),
        error: { status: 500, stack: error.stack },
      });
    }
  };
  // Đăng xuất người dùng
  public static logout = (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        req.flash('error_msg', t('error.logoutFail'));
      } else {
        res.redirect('/login');
      }
    });
  };

  public static getList = async (req: Request, res: Response) => {
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
      req.flash('error_msg', 'error.logoutFail');
      res.redirect('../');
    }
  };

  public static getCreate = (req: Request, res: Response) => {
    try {
      const roles = Object.values(UserRoles);
      return res.render('users/create_user', { roles });
    } catch (error) {
      req.flash('error_msg', 'error.createFail');
      res.redirect('/admin/users');
    }
  };

  public static postCreate = async (req: Request, res: Response) => {
    const data = req.body;
    try {
      const user = await UserService.findByUsername(data.username);
      if (user) {
        req.flash('error_msg', t('error.createFail'));
        return res.redirect('/admin/users/create');
      }
      const password = '123456';
      // Mã hóa mật khẩu trước khi lưu
      const hashedPassword = await hashPassword(password);
      // Thay thế mật khẩu gốc bằng mật khẩu đã mã hóa
      data.password = hashedPassword;
      const isValue = await UserService.create(data);
      if (!isValue) {
        req.flash('error_msg', 'error.createFail');
        return res.redirect('/admin/users/create');
      }
      req.flash('success_msg', t('success.createSuccess'));
      return res.redirect('/admin/users');
    } catch (error) {
      req.flash('error_msg', 'error.createFail');
      return res.render('error', {
        message: 'An error occurred during login',
        error: { status: 500, stack: error.stack },
      });
    }
  };
}

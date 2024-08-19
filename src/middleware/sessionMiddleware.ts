import { Request, Response, NextFunction } from 'express';

export function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Sử dụng res.locals để lưu trữ dữ liệu người dùng
  res.locals.user = (req.session as any).user;
  res.locals.otp = (req.session as any).otp;
  res.locals.newPassword = (req.session as any).newPassword;
  next();
}

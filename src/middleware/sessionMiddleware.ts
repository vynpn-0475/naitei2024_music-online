import { Request, Response, NextFunction } from 'express';

export function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Sử dụng res.locals để lưu trữ dữ liệu người dùng
  res.locals.user = (req.session as any).user;
  next();
}

import { StatusCode } from './statusCode';
import { Response } from 'express';

export class BaseResponse {
  private res: Response;
  private statusCode: StatusCode;
  private message: string;
  private data: any;

  public constructor(
    res: Response,
    statusCode: StatusCode,
    message: string,
    data: any
  ) {
    this.res = res;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
  public static new(
    res: Response,
    statusCode: StatusCode,
    message: string,
    data: any
  ) {
    return new BaseResponse(res, statusCode, message, data);
  }
  public send(viewName: string, locals: any = {}) {
    return this.res
      .status(this.statusCode)
      .render(viewName, { message: this.message, ...locals });
  }
}

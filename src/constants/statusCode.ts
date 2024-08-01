export enum StatusCode {
  Success = 200,
  Created = 201,
  Updated = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

export const StatusCodeMessage = {
  [StatusCode.Success]: 'Success',
  [StatusCode.Created]: 'Created',
  [StatusCode.Updated]: 'Updated',
  [StatusCode.BadRequest]: 'Bad Request',
  [StatusCode.Unauthorized]: 'Unauthorized',
  [StatusCode.Forbidden]: 'Forbidden',
  [StatusCode.NotFound]: 'Not Found',
  [StatusCode.InternalServerError]: 'Internal Server Error',
};

import { Response } from 'express';
import { IApiResponse } from './api-response';

export const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const responseData: IApiResponse<T> = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || 'Success',
    data: data.data ?? null,
    meta: data.meta ?? null,
  };

  res.status(data.statusCode).json(responseData);
};

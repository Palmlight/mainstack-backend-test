import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { errorResponse } from '../utils/response.util';
import { BAD_REQUEST } from 'http-status';

export const validateData = (
  schema: z.ZodTypeAny,
  type: 'body' | 'query' | 'params' = 'body',
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[type];
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse({
          message: error.errors.map((err) => err.message).join(', '),
          statusCode: BAD_REQUEST,
          res,
        });
      }
    }
  };
};

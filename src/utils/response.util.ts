import { NextFunction, Request, Response } from 'express';
import { NOT_FOUND } from 'http-status';

export type anyObject = Record<string, unknown>;

export interface ResponseParams {
  res: Response;
  message?: string;
  data?: anyObject;
  statusCode?: number;
}

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

export const successfulResponse = ({
  res,
  data,
  message,
  statusCode = 200,
}: ResponseParams) => {
  res.status(statusCode).json({
    status: 'success',
    message: message,
    data: data,
  });
};

export const errorResponse = ({
  res,
  message,
  statusCode = 500,
}: ResponseParams) => {
  res.status(statusCode).json({
    status: 'error',
    message: message,
  });
};

export const notFoundResponse = ({
  res,
  message = 'Not Found',
  statusCode = 404,
}: ResponseParams) => {
  res.status(statusCode).json({
    status: 'error',
    message: message,
  });
};

export const unknownRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(NOT_FOUND).json({
    message: 'Route not found',
  });
};

export const appErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
};

import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code,
  });
}


/**
 * AppError — a typed error class that Fastify's global error handler
 * already knows how to serialise via error.statusCode and error.code.
 */
export class AppError extends Error {
  statusCode: number;
  code: string;
 
  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}
 
export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
 
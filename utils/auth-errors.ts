// utils/auth-errors.ts
import { AuthError } from '@/types/auth';
import { AuthErrorCode, AUTH_ERROR_CODES } from '@/constants/auth-errors';

export class CustomAuthError extends Error implements AuthError {
  public code: AuthErrorCode;
  public statusCode: number;

  constructor(code: AuthErrorCode, message: string, statusCode: number = 400) {
    super(message);
    this.name = 'CustomAuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const createAuthError = (code: AuthErrorCode): CustomAuthError => {
  const errorMap: Record<AuthErrorCode, { message: string; statusCode: number }> = {
    [AUTH_ERROR_CODES.MISSING_CREDENTIALS]: {
      message: 'Please enter both username and password.',
      statusCode: 400,
    },
    [AUTH_ERROR_CODES.USER_NOT_FOUND]: {
      message: 'Account not found. Please check your username or sign up.',
      statusCode: 404,
    },
    [AUTH_ERROR_CODES.INVALID_PASSWORD]: {
      message: 'Invalid username or password. Please try again.',
      statusCode: 401,
    },
    [AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED]: {
      message: 'Your account is not verified. Please check your email for the verification link.',
      statusCode: 403,
    },
    [AUTH_ERROR_CODES.INVALID_INPUT]: {
      message: 'Invalid input provided. Please check your details.',
      statusCode: 400,
    },
    [AUTH_ERROR_CODES.UNEXPECTED_ERROR]: {
      message: 'An unexpected error occurred. Please try again later.',
      statusCode: 500,
    },
  };

  const { message, statusCode } = errorMap[code];
  return new CustomAuthError(code, message, statusCode);
};

export { AUTH_ERROR_CODES };

// hooks/useAuthErrors.ts
import { AUTH_ERROR_CODES, createAuthError } from '@/utils/auth-errors';

export const useAuthErrors = () => {
  const getErrorMessage = (errorCode: string): string => {
    // Handle NextAuth default error
    if (errorCode === 'CredentialsSignin') {
      return createAuthError(AUTH_ERROR_CODES.INVALID_PASSWORD).message;
    }

    // Handle our custom error codes
    if (Object.values(AUTH_ERROR_CODES).includes(errorCode as any)) {
      return createAuthError(errorCode as any).message;
    }

    // Fallback for unknown errors
    return createAuthError(AUTH_ERROR_CODES.UNEXPECTED_ERROR).message;
  };

  return { getErrorMessage };
};
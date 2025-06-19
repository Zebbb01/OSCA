// services/auth.service.ts
import { ZodError } from 'zod';
import { comparePassword } from '@/utils/password';
import { loginSchema } from '@/schema/auth/login.schema';
import { AUTH_ERROR_CODES, createAuthError } from '@/utils/auth-errors';
import prisma from '@/prisma/prisma';

export class AuthService {
  static async validateCredentials(credentials: any) {
    if (!credentials?.username || !credentials?.password) {
      throw createAuthError(AUTH_ERROR_CODES.MISSING_CREDENTIALS);
    }

    try {
      return await loginSchema.parseAsync(credentials);
    } catch (err) {
      if (err instanceof ZodError) {
        console.error('Validation Error:', err.errors);
        throw createAuthError(AUTH_ERROR_CODES.INVALID_INPUT);
      }
      throw err;
    }
  }

  static async authenticateUser(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw createAuthError(AUTH_ERROR_CODES.USER_NOT_FOUND);
    }

    if (!(await comparePassword(password, user.password))) {
      throw createAuthError(AUTH_ERROR_CODES.INVALID_PASSWORD);
    }

    if (!user.emailVerified) {
      throw createAuthError(AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED);
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
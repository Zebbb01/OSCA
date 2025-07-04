// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/prisma/prisma';
import { AuthService } from '@/services/auth.service';
import { CustomAuthError, AUTH_ERROR_CODES, createAuthError } from '@/utils/auth-errors';

const { handlers } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { username, password } = await AuthService.validateCredentials(credentials);
          return await AuthService.authenticateUser(username, password);
        } catch (err) {
          if (err instanceof CustomAuthError) {
            throw new Error(err.code); // NextAuth will use this as the error type
          }
          
          console.error('Authorization error:', err);
          throw new Error(AUTH_ERROR_CODES.UNEXPECTED_ERROR);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = (user as any).role;
        token.emailVerified = (user as any).emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username;
        session.user.email = token.email;
        (session.user as any).role = token.role;
        (session.user as any).emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});

export const { GET, POST } = handlers;
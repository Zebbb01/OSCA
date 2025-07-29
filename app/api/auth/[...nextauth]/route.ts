// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
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
            throw new Error(err.code);
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
        token.id = user.id as string;
        token.username = user.username as string;
        token.email = user.email as string;
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
    // Add this redirect callback
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/', // Your login page
  },
  trustHost: true, // Important for dev tunnels
});

export const { GET, POST } = handlers;
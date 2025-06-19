import NextAuth from 'next-auth';
import prisma from '@/prisma/prisma';

import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { loginSchema } from '@/schema/auth/login.schema';
import { ZodError } from 'zod';
import { comparePassword } from '@/utils/password';

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
                    if (!credentials?.username || !credentials?.password) return null;

                    console.log('JAKE THE LOGIN ADMINISTRATOR');

                    const { username, password } = await loginSchema.parseAsync(credentials);

                    const user = await prisma.user.findUnique({
                        where: { username },
                    });

                    if (user && (await comparePassword(password, user.password))) {
                        // --- ADD THIS EMAIL VERIFICATION CHECK ---
                        if (!user.emailVerified) {
                            // If email is not verified, return null to prevent login
                            // You can also throw an error to provide a specific message to the client
                            throw new Error('Email not verified. Please check your inbox for the verification link.');
                        }
                        // --- END OF EMAIL VERIFICATION CHECK ---

                        return {
                            id: user.id,
                            name: user.name,
                            username: user.username,
                            email: user.email,
                            role: user.role,
                        };
                    }

                    return null; // Invalid credentials
                } catch (err: any) { // Catch the thrown error
                    if (err instanceof ZodError) {
                        console.error('Zod Validation Error:', err.errors);
                        // You might want to re-throw or return a specific error for validation
                        throw new Error('Invalid input for username or password.');
                    }
                    // Handle the custom error for email verification
                    if (err.message === 'Email not verified. Please check your inbox for the verification link.') {
                        throw err; // Re-throw the specific error
                    }
                    console.error('Authorization error:', err);
                    return null; // Generic error, do not log in
                }
            },
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            // First time JWT is created (on login)
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.username = user.username;
                token.email = user.email;
                token.role = (user as any).role;
                // Add emailVerified to the token for easier access in the session
                token.emailVerified = (user as any).emailVerified;
            }

            console.log('Final Token:', token);

            return token; // Return the modified token
        },

        async session({ session, token }) {
            // Attach data from token to session
            if (session.user) { // Ensure session.user exists
                session.user.id = token.id as string;
                session.user.name = token.name;
                session.user.username = token.username;
                session.user.email = token.email;
                (session.user as any).role = token.role;
                // Add emailVerified to the session
                (session.user as any).emailVerified = token.emailVerified;
            }

            console.log('Final Session Data:', session);

            return session;
        },
    },

    session: {
        strategy: 'jwt',
    },
    // Optional: Add a custom pages configuration to redirect to a specific page
    // for unverified emails or other errors.
    pages: {
        signIn: '/auth/login', // Your login page
        // error: '/auth/login?error=EmailNotVerified', // Example for a specific error message
    },
});

export const { GET, POST } = handlers;
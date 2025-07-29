// next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            username: string
            email: string
            role: 'USER' | 'ADMIN' // Adjust this based on your enum
        } & DefaultSession['user']
    }

    interface User {
        role: 'USER' | 'ADMIN' // Adjust this based on your enum
    }
    interface User extends DefaultUser {
        username?: string
        role?: string
    }
    interface Session {
        user?: {
            id?: string
            email?: string | null
            username?: string
            role?: string
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        username: string
        email: string
        role: 'USER' | 'ADMIN' // Adjust this based on your enum
    }
}

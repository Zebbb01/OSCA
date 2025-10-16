// app/unauthorized/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, LogOut } from 'lucide-react'

export default function UnauthorizedPage() {
    const router = useRouter()
    const { data: session, status } = useSession()

    useEffect(() => {
        // If no session, redirect to login
        if (status === 'loading') return // Still loading
        if (!session) {
            router.push('/')
            return
        }
    }, [session, status, router])

    const handleGoBack = () => {
        const userRole = (session?.user as any)?.role
        if (userRole === 'ADMIN') {
            router.push('/admin/dashboard')
        } else if (userRole === 'USER') {
            router.push('/staff/dashboard')
        } else {
            router.push('/')
        }
    }

    const handleLogout = async () => {
        await signOut({ redirectTo: '/' })
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Access Denied</CardTitle>
                    <CardDescription className="text-gray-600">
                        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Button
                        onClick={handleGoBack}
                        className="w-full"
                        variant="default"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Go to Dashboard
                    </Button>
                    
                    <Button
                        onClick={handleLogout}
                        className="w-full"
                        variant="outline"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>

                    {session?.user && (
                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <p className="text-sm text-gray-500">
                                Logged in as: <span className="font-medium">{(session.user as any)?.username}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                Role: <span className="font-medium">{(session.user as any)?.role}</span>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

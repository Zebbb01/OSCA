// app/admin/page.tsx
"use client"
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNavigationWithLoading } from '@/components/providers/NavigationLoadingProvider'
import { Loader2 } from 'lucide-react'

const AdminRoot = () => {
    const { push } = useNavigationWithLoading()
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === 'loading') return

        const userRole = (session?.user as any)?.role || 'USER'

        if (userRole === 'ADMIN') {
            push('/admin/dashboard')
        } else if (userRole === 'USER') {
            push('/staff/record')
        } else {
            push('/')
        }
    }, [session, status, push])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
    )
}

export default AdminRoot
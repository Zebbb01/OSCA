"use client"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react' // Import useSession

const AdminRoot = () => {
    const router = useRouter()
    const { data: session, status } = useSession()

    useEffect(() => {
        if (status === 'loading') return // Do nothing while session is loading

        const userRole = (session?.user as any)?.role || 'USER' // Get user's role

        if (userRole === 'ADMIN') {
            router.replace('/admin/dashboard')
        } else if (userRole === 'USER') { // Assuming 'USER' role is for staff
            router.replace('/staff/senior-citizen/record')
        } else {
            // Handle other roles or unauthenticated users, e.g., redirect to login
            router.replace('/auth/login'); // Or your login page path
        }
    }, [router, session, status]) // Add session and status to dependencies

    return null
}

export default AdminRoot
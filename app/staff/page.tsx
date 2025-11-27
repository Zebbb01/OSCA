// app/staff/page.tsx
"use client"
import { useEffect } from 'react'
import { useNavigationWithLoading } from '@/components/providers/NavigationLoadingProvider'
import { Loader2 } from 'lucide-react'

const StaffRoot = () => {
    const { replace } = useNavigationWithLoading()

    useEffect(() => {
        replace('/staff/record')
    }, [replace])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
    )
}

export default StaffRoot
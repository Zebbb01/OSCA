// app/staff/page.tsx
"use client"
import {  useRouter } from 'next/navigation'
import { useEffect } from 'react'

const StaffRoot = () => {
    const router = useRouter()

    useEffect(() => {
        router.replace('/staff/record')
    }, [router])

    return null
}

export default StaffRoot

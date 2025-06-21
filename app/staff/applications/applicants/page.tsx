// app\admin\applications\applicants\page.tsx
'use client'

import { useState, useMemo } from 'react' // Import useMemo
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react' // Import useSession for user role

import { DataTable } from '@/components/data-table'
import { getApplicantsColumns } from './columns' // Import the function, not the constant
import { ListBoxComponent } from '@/components/listbox-component' // Keep if used for other filters
import { apiService } from '@/lib/axios'
import { BenefitApplicationData } from '@/types/application' // Assuming this type is correct

const dummyApplicantsData = [
    {
        id: 1,
        firstname: 'Maria',
        middlename: 'Santos',
        lastname: 'Reyes',
        email: 'maria.reyes@example.com',
        benefits: {
            name: 'Monthly Allowance',
        },

        status: {
            name: 'PENDING',
        },

        category: {
            name: 'Low-income seniors',
        },
        createdAt: new Date('2024-12-01T10:00:00Z'),
    },

    {
        id: 1,
        firstname: 'Maria',
        middlename: 'Santos',
        lastname: 'Reyes',
        email: 'maria.reyes@example.com',
        benefits: {
            name: 'Monthly Allowance',
        },

        status: {
            name: 'PENDING',
        },

        category: null,
        createdAt: new Date('2024-12-01T10:00:00Z'),
    },
]

const benefits = [
    {
        id: 1,
        name: 'Monthly Allowance',
    },
    {
        id: 2,
        name: 'Medical assistance',
    },
    {
        id: 3,
        name: 'Discount privileges',
    },
]

const ApplicantPage = () => {
    // Get session data and status to determine user role
    const { data: session, status: sessionStatus } = useSession()
    const userRole = (session?.user as any)?.role || 'USER' // Default to 'USER' if role is not available

    // USE QUERY FOR FETCHING APPLICATIONS DATA
    const benefitApplicationQuery = useQuery<BenefitApplicationData[]>({ // Explicitly type useQuery
        queryKey: ['applications'],
        queryFn: async () => {
            const respData = await apiService.get<BenefitApplicationData[]>(
                '/api/benefits/application'
            )
            return respData
        },
        staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
        refetchOnWindowFocus: true,
    })

    console.log("BenefitApplicationData: ", benefitApplicationQuery.data);

    // Memoize the columns, passing the userRole and sessionStatus
    // This ensures columns are re-calculated only when userRole or sessionStatus changes
    const columns = useMemo(() => {
        return getApplicantsColumns(userRole, sessionStatus)
    }, [userRole, sessionStatus])


    // SELECTED BENEFIT FILTER STATE (if you intend to use this for filtering the DataTable)
    const [selected, setSelected] = useState(benefits[2])

    return (
        <div className="container mx-auto border-1 border-gray-400 p-5 rounded-md mt-8">
            <div className="flex flex-col justify-center mb-6">
                <h1 className="text-2xl text-gray-600">Senior Citizen Benefit Applicants</h1>
                <p className="text-gray-500 text-sm">
                    View and manage records of senior citizens applying for OSCA benefits, including
                    their personal details, application status, and supporting documents.
                </p>
            </div>

            {benefitApplicationQuery.isLoading || sessionStatus === 'loading' ? (
                <div className="py-10 text-gray-500 text-lg flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading applications...
                </div>
            ) : benefitApplicationQuery.isError ? (
                <div className="py-10 text-red-500 text-lg text-center">
                    Failed to load application data: {benefitApplicationQuery.error.message || 'An unexpected error occurred.'}
                </div>
            ) : benefitApplicationQuery.data && benefitApplicationQuery.data.length === 0 ? (
                <div className="py-10 text-gray-400 text-lg text-center">No application records found.</div>
            ) : (
                <DataTable columns={columns} data={benefitApplicationQuery.data ?? []} />
            )}
        </div>
    )
}

export default ApplicantPage
// app\admin\applications\applicants\page.tsx
'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { ColumnFiltersState } from '@tanstack/react-table'

import { DataTable } from '@/components/data-table'
import { getApplicantsColumns } from './columns'
import { apiService } from '@/lib/axios'
import { BenefitApplicationData } from '@/types/application'


const ApplicantPage = () => {
    const { data: session, status: sessionStatus } = useSession()
    const userRole = (session?.user as any)?.role || 'USER'

    // State for global filter (search)
    const [globalFilter, setGlobalFilter] = useState<string>('')
    // State for column filters
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    // State for filter dropdown visibility
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false)

    const applicantInitialVisibleColumns = [
        'fullname',
        'applied_benefit',
        'senior_category',
        'status',
        'createdAt',
        'documents',
        'actions', // If admin, actions will be visible
    ];

    const benefitApplicationQuery = useQuery<BenefitApplicationData[]>({
        queryKey: ['applications'],
        queryFn: async () => {
            const respData = await apiService.get<BenefitApplicationData[]>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application`
            )
            return respData
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    })

    console.log("BenefitApplicationData: ", benefitApplicationQuery.data);

    const columns = useMemo(() => {
        return getApplicantsColumns(userRole, sessionStatus)
    }, [userRole, sessionStatus])

    const filterableColumns = useMemo(() => {
        const applicationsData = benefitApplicationQuery.data ?? [];

        // Extract unique benefit names
        const benefitOptions = Array.from(new Set(applicationsData.map(app => app.benefit.name)))
            .filter(Boolean) // Filter out any undefined or null
            .map(name => ({ value: name, label: name }));

        // Extract unique category names
        const categoryOptions = Array.from(new Set(applicationsData.map(app => app.category?.name || 'N/A')))
            .filter(name => name !== 'N/A') // Filter out 'N/A' if you don't want it as an explicit filter option
            .map(name => ({ value: name, label: name }));

        // Extract unique status names
        const statusOptions = Array.from(new Set(applicationsData.map(app => app.status.name)))
            .filter(Boolean) // Filter out any undefined or null
            .map(name => ({ value: name, label: name }));

        return [
            {
                id: 'applied_benefit', // Corresponds to accessorKey in columns.tsx
                title: 'Applied Benefit',
                type: 'select' as const,
                options: benefitOptions,
            },
            {
                id: 'senior_category', // Corresponds to accessorKey in columns.tsx
                title: 'Category',
                type: 'select' as const,
                options: categoryOptions,
            },
            {
                id: 'status', // Corresponds to accessorKey in columns.tsx
                title: 'Status',
                type: 'select' as const,
                options: statusOptions,
            },
        ];
    }, [benefitApplicationQuery.data]);

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
                <DataTable
                    columns={columns}
                    data={benefitApplicationQuery.data ?? []}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    columnFilters={columnFilters}
                    setColumnFilters={setColumnFilters}
                    filterableColumns={filterableColumns}
                    isFilterDropdownOpen={isFilterDropdownOpen}
                    setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                    initialVisibleColumns={applicantInitialVisibleColumns}
                />
            )}
        </div>
    )
}

export default ApplicantPage
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useSession } from 'next-auth/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { format } from 'date-fns'; // Import format from date-fns

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import RegisterFormComponents from '@/components/senior-citizen/registerForm/RegisterForm';
import { UploadMedicalDocumentsForm } from '@/components/senior-documents/medical-documents-form';
import { apiService } from '@/lib/axios';
import { Seniors } from '@/types/seniors';
import { DownloadReleasedSeniorsReport } from '@/components/senior-citizen/reports/download-released-seniors-report';
import { getSeniorRecordsColumns } from '@/app/admin/senior-citizen/record/columns';
import { DataTable } from '../data-table';

interface SeniorQueryParams {
    name?: string;
    gender?: 'male' | 'female';
    purok?: string;
    barangay?: string;
    remarks?: string;
    releaseStatus?: 'Released' | 'Unreleased';
}

interface SeniorRecordsPageContentProps {
    userRole: string; // Pass the user role as a prop
}

const SeniorRecordsPageContent: React.FC<SeniorRecordsPageContentProps> = ({ userRole }) => {
    const { status: sessionStatus } = useSession(); // session object is not directly used here, only status
    const queryClient = useQueryClient();

    const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(false);
    const [showUploadMedicalModal, setShowUploadMedicalModal] = useState<boolean>(false);

    const [globalFilter, setGlobalFilter] = useState('');
    const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState('');

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

    // Get today's date and format it once
    const today = useMemo(() => {
        return format(new Date(), 'MMMM dd, yyyy'); // e.g., "July 29, 2025"
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedGlobalFilter(globalFilter);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [globalFilter]);

    // Columns are now memoized based on userRole and sessionStatus
    const columns = useMemo(() => {
        return getSeniorRecordsColumns(userRole, sessionStatus);
    }, [userRole, sessionStatus]);

    const generateQueryParams = useMemo(() => {
        return (filters: ColumnFiltersState): SeniorQueryParams => {
            const params: SeniorQueryParams = {};
            filters.forEach(filter => {
                if (Array.isArray(filter.value) && filter.value.length > 0) {
                    const value = filter.value[0];

                    switch (filter.id) {
                        case 'gender':
                            if (value === 'male' || value === 'female') {
                                params.gender = value;
                            }
                            break;
                        case 'purok':
                            params.purok = value as string;
                            break;
                        case 'barangay':
                            params.barangay = value as string;
                            break;
                    }
                }
            });
            return params;
        };
    }, []);

    const seniorRecordInitialVisibleColumns = [
        'fullname',
        'contact_no',
        'purok',
        'barangay',
        'gender',
        'documents',
        'actions', // If admin, actions will be visible
        'user-actions', // If user, user-actions will be visible
    ];

    const currentQueryParams = generateQueryParams(columnFilters);

    const seniorQuery = useQuery<Seniors[]>({
        queryKey: ['seniors', debouncedGlobalFilter, currentQueryParams],
        queryFn: async () => {
            // Construct query parameters
            const params: Record<string, string> = {};
            if (debouncedGlobalFilter) {
                params.name = debouncedGlobalFilter;
            }
            Object.entries(currentQueryParams).forEach(([key, value]) => {
                if (value) {
                    params[key] = String(value);
                }
            });

            // Use apiService with the relative path and pass parameters
            console.log('Fetching seniors with params:', params);
            const response = await apiService.get<Seniors[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`, { params });
            console.log('Fetched seniors data with filters: ', response);
            return response;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    });

    // Determine if the current user has 'USER' role (staff) or 'ADMIN' role
    const isAdmin = userRole === 'ADMIN';
    const isUser = userRole === 'USER'; // Staff role

    const filterableColumns = useMemo(() => {
        const seniorsData = seniorQuery.data ?? [];

        return [
            { id: 'gender', title: 'Gender', type: 'select' as const, options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }] },
            {
                id: 'purok',
                title: 'Purok',
                type: 'select' as const,
                options: Array.from(new Set(seniorsData.map(s => s.purok))).filter(Boolean).map(purok => ({ value: purok, label: purok }))
            },
            {
                id: 'barangay',
                title: 'Barangay',
                type: 'select' as const,
                options: Array.from(new Set(seniorsData.map(s => s.barangay))).filter(Boolean).map(barangay => ({ value: barangay, label: barangay }))
            },
        ];
    }, [seniorQuery.data]);

    const refreshTable = () => {
        queryClient.invalidateQueries({ queryKey: ['seniors'] });
    };

    return (
        <div className="container mx-auto p-5 rounded-md mt-8 border border-gray-200 shadow-sm">
            <div className="flex flex-col mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Senior Citizen Records</h1>
                <p className="text-gray-600 text-base mt-1">
                    Efficiently manage and view comprehensive records of registered senior citizens.
                </p>
            </div>

            <div className="flex justify-end gap-3 mb-4">
                {/* Download Report button visible for USER role (staff) */}
                {(isUser || isAdmin) && seniorQuery.data && (
                    <DownloadReleasedSeniorsReport data={seniorQuery.data} />
                )}

                {/* Register New button visible for USER role (staff) */}
                {isUser && (
                    <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
                        <DialogTrigger asChild>
                            <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200">
                                <FontAwesomeIcon icon={faCirclePlus} className="size-4" />
                                Register New
                            </Button>
                        </DialogTrigger>

                        <DialogContent
                            onEscapeKeyDown={(e) => e.preventDefault()}
                            onPointerDownOutside={(e) => e.preventDefault()}
                            className="!max-w-3xl overflow-y-auto max-h-[90vh]"
                        >
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold">Register New Senior Citizen</DialogTitle>
                                {/* Display Today's Date Here */}
                                <p className="text-gray-500 text-sm mt-1">
                                    Today's Date: <span className="font-medium">{today}</span>
                                </p>
                                <DialogDescription>
                                    Complete the form below to register a new senior citizen into the system.
                                </DialogDescription>
                            </DialogHeader>
                            <RegisterFormComponents setShowRegistrationModal={setShowRegistrationModal} onRecordAdded={refreshTable} />
                        </DialogContent>
                    </Dialog>
                )}

                {/* Upload Medical Documents button visible for USER role (staff) */}
                {isUser && (
                    <Button
                        onClick={() => setShowUploadMedicalModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200"
                    >
                        <FontAwesomeIcon icon={faPlus} className="size-4" />
                        Upload Medical Documents
                    </Button>
                )}

                <UploadMedicalDocumentsForm
                    isOpen={showUploadMedicalModal}
                    onClose={() => setShowUploadMedicalModal(false)}
                    onUploadSuccess={refreshTable}
                />
            </div>

            {seniorQuery.isLoading || sessionStatus === 'loading' ? (
                <div className="text-center py-10 text-gray-500 flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Senior Records...
                </div>
            ) : seniorQuery.isError ? (
                <div className="text-center py-10 text-red-500">
                    Error loading records: {seniorQuery.error.message || 'An unexpected error occurred.'}
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={seniorQuery.data ?? []}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    columnFilters={columnFilters}
                    setColumnFilters={setColumnFilters}
                    filterableColumns={filterableColumns}
                    isFilterDropdownOpen={isFilterDropdownOpen}
                    setIsFilterDropdownOpen={setIsFilterDropdownOpen}
                    initialVisibleColumns={seniorRecordInitialVisibleColumns}
                />
            )}
        </div>
    );
};

export default SeniorRecordsPageContent;
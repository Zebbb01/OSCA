'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { OverviewCard } from '@/components/financial-monitoring/overview-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateOnly } from '@/utils/format';
import { DollarSign, Users, CalendarDays, ReceiptText, FileText, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/axios';
import { Seniors } from '@/types/seniors';
import { BenefitApplicationData } from '@/types/application';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ReportGenerator } from '@/components/reports/ReportGenerator';

// Types for monthly release data
export type MonthlyReleaseDetail = {
    beneficiaryName: string;
    amount: number;
    status: 'Claimed' | 'Unclaimed';
    seniorId: number;
    releaseDate?: string;
    claimDate?: string;
};

export type MonthlyRelease = {
    id: string;
    month: string;
    releaseDate: string;
    totalAmountReleased: number;
    numberOfBeneficiaries: number;
    status: 'Released' | 'Pending' | 'Processing';
    details: MonthlyReleaseDetail[];
};

export default function StaffMonthlyReleasePage() {
    const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);

    // Fetch seniors data for monthly release calculations
    const { data: seniorsData, isLoading: seniorsLoading } = useQuery<Seniors[]>({
        queryKey: ['seniors-monthly-release-staff'],
        queryFn: async () => {
            return await apiService.get<Seniors[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`);
        },
        staleTime: 5 * 60 * 1000,
    });

    // Fetch applications data for monthly release calculations
    const { data: applicationsData, isLoading: applicationsLoading } = useQuery<BenefitApplicationData[]>({
        queryKey: ['applications-monthly-release-staff'],
        queryFn: async () => {
            return await apiService.get<BenefitApplicationData[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application`);
        },
        staleTime: 5 * 60 * 1000,
    });

    // Generate monthly releases from real data
    const monthlyReleases: MonthlyRelease[] = React.useMemo(() => {
        if (!seniorsData || !applicationsData) return [];

        const releases: MonthlyRelease[] = [];
        const now = new Date();

        // Generate data for the last 12 months
        for (let i = 0; i < 12; i++) {
            const monthDate = subMonths(now, i);
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);
            const monthKey = format(monthDate, 'yyyy-MM');
            const monthLabel = format(monthDate, 'MMMM yyyy');

            // Filter seniors released in this month
            const monthReleasedSeniors = seniorsData.filter(senior => {
                if (!senior.releasedAt) return false;
                const releaseDate = new Date(senior.releasedAt);
                return releaseDate >= monthStart && releaseDate <= monthEnd;
            });

            // Filter applications created in this month
            const monthApplications = applicationsData.filter(app => {
                const appDate = new Date(app.createdAt);
                return appDate >= monthStart && appDate <= monthEnd;
            });

            // Create release details
            const details: MonthlyReleaseDetail[] = [];
            
            // Add released seniors
            monthReleasedSeniors.forEach(senior => {
                details.push({
                    beneficiaryName: `${senior.firstname} ${senior.lastname}`,
                    amount: 5000, // Standard amount
                    status: 'Claimed',
                    seniorId: senior.id,
                    releaseDate: senior.releasedAt?.toString(),
                    claimDate: senior.releasedAt?.toString(),
                });
            });

            // Add some pending releases from approved applications
            const approvedApps = monthApplications.filter(app => app.status.name === 'APPROVED');
            approvedApps.slice(0, Math.min(3, approvedApps.length)).forEach(app => {
                // Only add if not already released
                const alreadyReleased = monthReleasedSeniors.some(senior => senior.id === app.senior_id);
                if (!alreadyReleased) {
                    details.push({
                        beneficiaryName: `${app.senior.firstname} ${app.senior.lastname}`,
                        amount: 5000,
                        status: 'Unclaimed',
                        seniorId: app.senior_id,
                        releaseDate: format(monthEnd, 'yyyy-MM-dd'),
                    });
                }
            });

            const totalAmount = details.reduce((sum, detail) => sum + detail.amount, 0);
            const status: 'Released' | 'Pending' | 'Processing' = 
                i === 0 ? 'Processing' : 
                i === 1 ? 'Pending' : 
                'Released';

            releases.push({
                id: monthKey,
                month: monthLabel,
                releaseDate: format(monthEnd, 'yyyy-MM-dd'),
                totalAmountReleased: totalAmount,
                numberOfBeneficiaries: details.length,
                status,
                details
            });
        }

        return releases.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
    }, [seniorsData, applicationsData]);

    // Calculate overall statistics
    const totalAmountReleasedOverall = monthlyReleases.reduce((sum, release) => sum + release.totalAmountReleased, 0);
    const totalBeneficiariesOverall = monthlyReleases.reduce((sum, release) => sum + release.numberOfBeneficiaries, 0);

    // Find the currently selected month's details for the "Details" tab
    const selectedRelease = selectedMonthId
        ? monthlyReleases.find(release => release.id === selectedMonthId)
        : null;

    const handleViewDetails = (releaseId: string) => {
        setSelectedMonthId(releaseId);
    };

    // Helper functions for calculations
    const calculateTotalClaimed = (release: MonthlyRelease): number => {
        return release.details
            .filter(detail => detail.status === 'Claimed')
            .reduce((sum, detail) => sum + detail.amount, 0);
    };

    const calculateTotalUnclaimed = (release: MonthlyRelease): number => {
        return release.details
            .filter(detail => detail.status === 'Unclaimed')
            .reduce((sum, detail) => sum + detail.amount, 0);
    };

    const isLoading = seniorsLoading || applicationsLoading;

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent lg:h-[--nav-height] lg:px-6">
                        <h1 className="text-2xl font-semibold">Monthly Financial Release</h1>
                    </header>
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        <div className="text-center py-10 text-gray-500 flex items-center justify-center">
                            <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading monthly release data...
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent lg:h-[--nav-height] lg:px-6">
                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-2xl font-semibold">Monthly Financial Release</h1>
                        <div className="flex gap-2">
                            <ReportGenerator
                                reportTitle="Staff Monthly Financial Release Report"
                                data={monthlyReleases}
                                reportType="monthly-release"
                                variant="outline"
                                size="sm"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Monthly Report
                            </ReportGenerator>
                            <ReportGenerator
                                reportTitle="Staff All Monthly Release Data Export"
                                data={monthlyReleases}
                                reportType="monthly-release"
                                variant="default"
                                size="sm"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export All Data
                            </ReportGenerator>
                        </div>
                    </div>
                </header>

                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
                        {/* Overview Cards for Monthly Release */}
                        <div className="grid gap-4 sm:grid-cols-3 md:gap-8">
                            <OverviewCard
                                title="Total Released (Overall)"
                                value={`₱${totalAmountReleasedOverall.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                                description="Total funds disbursed across all recorded months."
                                icon={DollarSign}
                                iconColor="text-green-600"
                            />
                            <OverviewCard
                                title="Total Beneficiaries"
                                value={totalBeneficiariesOverall.toLocaleString()}
                                description="Cumulative count of beneficiaries across all releases."
                                icon={Users}
                                iconColor="text-blue-600"
                            />
                            <OverviewCard
                                title="Upcoming Release"
                                value={monthlyReleases.find(r => r.status === 'Pending')?.month || 'N/A'}
                                description="The next Pending release of funds."
                                icon={CalendarDays}
                                iconColor="text-purple-600"
                            />
                        </div>

                        {/* Tabs Section for Monthly Releases */}
                        <Tabs defaultValue="release-history" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="release-history">Release History</TabsTrigger>
                                <TabsTrigger value="release-details" disabled={!selectedMonthId}>
                                    {selectedRelease ? `${selectedRelease.month} Details` : 'Release Details'}
                                </TabsTrigger>
                            </TabsList>

                            {/* Release History Tab Content */}
                            <TabsContent value="release-history">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="grid gap-2">
                                            <CardTitle>Monthly Release History</CardTitle>
                                            <CardDescription>
                                                View a summary of all past and pending monthly financial releases based on actual data.
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <ReportGenerator
                                                reportTitle="Staff Monthly Release History Report"
                                                data={monthlyReleases}
                                                reportType="monthly-release"
                                                variant="outline"
                                                size="sm"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Export History
                                            </ReportGenerator>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Month</TableHead>
                                                        <TableHead>Release Date</TableHead>
                                                        <TableHead className="text-right">Amount</TableHead>
                                                        <TableHead className="text-right">Beneficiaries</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="w-[100px] text-center">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {monthlyReleases.length > 0 ? (
                                                        monthlyReleases.map((release) => (
                                                            <TableRow key={release.id}>
                                                                <TableCell className="font-medium">{release.month}</TableCell>
                                                                <TableCell>{formatDateOnly(release.releaseDate)}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {`₱${release.totalAmountReleased.toLocaleString('en-PH', {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    })}`}
                                                                </TableCell>
                                                                <TableCell className="text-right">{release.numberOfBeneficiaries}</TableCell>
                                                                <TableCell>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                        release.status === 'Released' ? 'bg-green-100 text-green-800' :
                                                                        release.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {release.status}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleViewDetails(release.id)}
                                                                    >
                                                                        View Details
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="h-24 text-center">
                                                                No monthly releases found.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Release Details Tab Content */}
                            <TabsContent value="release-details">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="grid gap-2">
                                            <CardTitle>{selectedRelease ? `${selectedRelease.month} Release Details` : 'Select a Month'}</CardTitle>
                                            <CardDescription>
                                                {selectedRelease
                                                    ? `Detailed breakdown of funds released and claimed by beneficiaries for ${selectedRelease.month}.`
                                                    : 'Please select a month from the "Release History" tab to view its details.'}
                                            </CardDescription>
                                        </div>
                                        {selectedRelease && (
                                            <div className="flex gap-2">
                                                <ReportGenerator
                                                    reportTitle={`Staff ${selectedRelease.month} Release Details`}
                                                    data={selectedRelease.details}
                                                    reportType="monthly-release"
                                                    selectedPeriod={selectedRelease.month}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Export Details
                                                </ReportGenerator>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        {selectedRelease ? (
                                            <>
                                                <div className="grid gap-4 mb-6 sm:grid-cols-2 md:gap-8">
                                                    <OverviewCard
                                                        title="Total Claimed"
                                                        value={`₱${calculateTotalClaimed(selectedRelease).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                        description="Amount claimed by beneficiaries."
                                                        icon={ReceiptText}
                                                        iconColor="text-green-500"
                                                    />
                                                    <OverviewCard
                                                        title="Total Unclaimed"
                                                        value={`₱${calculateTotalUnclaimed(selectedRelease).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                        description="Amount yet to be claimed."
                                                        icon={ReceiptText}
                                                        iconColor="text-red-500"
                                                    />
                                                </div>
                                                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Beneficiary Name</TableHead>
                                                                <TableHead className="text-right">Amount</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead>Date</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {selectedRelease.details.length > 0 ? (
                                                                selectedRelease.details.map((detail, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell className="font-medium">{detail.beneficiaryName}</TableCell>
                                                                        <TableCell className="text-right">
                                                                            {`₱${detail.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                                detail.status === 'Claimed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                                                            }`}>
                                                                                {detail.status}
                                                                            </span>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {detail.status === 'Claimed' && detail.claimDate
                                                                                ? formatDateOnly(detail.claimDate)
                                                                                : detail.releaseDate
                                                                                ? formatDateOnly(detail.releaseDate)
                                                                                : 'N/A'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))
                                                            ) : (
                                                                <TableRow>
                                                                    <TableCell colSpan={4} className="h-24 text-center">
                                                                        No beneficiary details for this month.
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-center">
                                                Select a month from the "Release History" tab to view its detailed breakdown.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}

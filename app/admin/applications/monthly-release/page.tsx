// app/admin/applications/monthly-release/page.tsx
'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { OverviewCard } from '@/components/financial-monitoring/overview-card'; // Re-use this component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateOnly } from '@/utils/format'; // Assuming you have this utility
import { DollarSign, Users, CalendarDays, ReceiptText } from 'lucide-react'; // New icons

import {
    MonthlyRelease,
    staticMonthlyReleases,
    calculateTotalReleasedOverall,
    calculateTotalBeneficiariesOverall,
    calculateTotalClaimed,
    calculateTotalUnclaimed,
} from '@/lib/static-data/monthly-releases'; // Import our new static data

export default function MonthlyReleasePage() {
    const [monthlyReleases, setMonthlyReleases] = useState<MonthlyRelease[]>(staticMonthlyReleases);
    const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);

    // Calculate overall statistics
    const totalAmountReleasedOverall = calculateTotalReleasedOverall(monthlyReleases);
    const totalBeneficiariesOverall = calculateTotalBeneficiariesOverall(monthlyReleases);

    // Find the currently selected month's details for the "Details" tab
    const selectedRelease = selectedMonthId
        ? monthlyReleases.find(release => release.id === selectedMonthId)
        : null;

    const handleViewDetails = (releaseId: string) => {
        setSelectedMonthId(releaseId);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent lg:h-[--nav-height] lg:px-6">
                    <h1 className="text-2xl font-semibold">Monthly Financial Release</h1>
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
                                value={monthlyReleases.find(r => r.status === 'Unreleased')?.month || 'N/A'}
                                description="The next Unreleased release of funds."
                                icon={CalendarDays}
                                iconColor="text-purple-600"
                            />
                        </div>

                        {/* Tabs Section for Monthly Releases */}
                        <Tabs defaultValue="release-history" className="w-full">
                            <TabsList className="grid w-full grid-cols-2"> {/* Adjusted for 2 tabs */}
                                <TabsTrigger value="release-history">Release History</TabsTrigger>
                                <TabsTrigger value="release-details" disabled={!selectedMonthId}>
                                    {selectedRelease ? `${selectedRelease.month} Details` : 'Release Details'}
                                </TabsTrigger>
                            </TabsList>

                            {/* Release History Tab Content */}
                            <TabsContent value="release-history">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Monthly Release History</CardTitle>
                                        <CardDescription>
                                            View a summary of all past and Unreleased monthly financial releases.
                                        </CardDescription>
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
                                                                        release.status === 'Unreleased' ? 'bg-blue-100 text-blue-800' :
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
                                    <CardHeader>
                                        <CardTitle>{selectedRelease ? `${selectedRelease.month} Release Details` : 'Select a Month'}</CardTitle>
                                        <CardDescription>
                                            {selectedRelease
                                                ? `Detailed breakdown of funds released and claimed by beneficiaries for ${selectedRelease.month}.`
                                                : 'Please select a month from the "Release History" tab to view its details.'}
                                        </CardDescription>
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
                                                                    </TableRow>
                                                                ))
                                                            ) : (
                                                                <TableRow>
                                                                    <TableCell colSpan={3} className="h-24 text-center">
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
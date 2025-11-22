'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpCircle, ArrowDownCircle, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OverviewCard } from '@/components/financial-monitoring/overview-card'
import { TransactionList } from '@/components/financial-monitoring/transaction-list'
import { AddTransactionDialog } from '@/components/financial-monitoring/add-transaction-dialog'
import { ReportGenerator } from '@/components/reports/ReportGenerator'

// Import Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateOnly } from '@/utils/format';
import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/lib/axios'
import { Seniors } from '@/types/seniors'
import { BenefitApplicationData } from '@/types/application'

// Updated types for real data
export type FinancialTransaction = {
    id: string;
    date: string;
    benefits: string;
    amount: number;
    type: 'released' | 'pending';
    category: string;
    seniorName?: string;
    barangay?: string;
}

export type ApprovedFund = {
    id: string;
    name: string;
    amount: number;
    dateApproved: string;
    benefitType: string;
    category: string;
}

export default function StaffGovernmentFundPage() {
    const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false)

    // Fetch seniors data for financial calculations
    const { data: seniorsData, isLoading: seniorsLoading } = useQuery<Seniors[]>({
        queryKey: ['seniors-financial-staff'],
        queryFn: async () => {
            return await apiService.get<Seniors[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`);
        },
        staleTime: 5 * 60 * 1000,
    });

    // Fetch applications data for financial calculations
    const { data: applicationsData, isLoading: applicationsLoading } = useQuery<BenefitApplicationData[]>({
        queryKey: ['applications-financial-staff'],
        queryFn: async () => {
            return await apiService.get<BenefitApplicationData[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application`);
        },
        staleTime: 5 * 60 * 1000,
    });

    // Transform real data into financial transactions
    const transactions: FinancialTransaction[] = React.useMemo(() => {
        if (!seniorsData || !applicationsData) return [];

        const financialTransactions: FinancialTransaction[] = [];

        // Create transactions from released seniors
        seniorsData.forEach(senior => {
            if (senior.releasedAt && senior.Applications && senior.Applications.length > 0) {
                const latestApp = senior.Applications[0];
                financialTransactions.push({
                    id: `released-${senior.id}`,
                    date: senior.releasedAt.toString(),
                    benefits: latestApp.benefit.name,
                    amount: 1000.00, // Default amount - you can adjust this based on benefit type
                    type: 'released',
                    category: latestApp.category?.name || 'Regular senior citizens',
                    seniorName: `${senior.firstname} ${senior.lastname}`,
                    barangay: senior.barangay
                });
            }
        });

        // Create transactions from pending applications
        applicationsData.forEach(app => {
            if (app.status.name === 'PENDING' || app.status.name === 'APPROVED') {
                financialTransactions.push({
                    id: `pending-${app.id}`,
                    date: app.createdAt,
                    benefits: app.benefit.name,
                    amount: 1000.00, // Default amount - you can adjust this based on benefit type
                    type: 'pending',
                    category: app.category?.name || 'Regular senior citizens',
                    seniorName: `${app.senior.firstname} ${app.senior.lastname}`,
                    barangay: 'N/A' // Applications don't have direct barangay access
                });
            }
        });

        return financialTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [seniorsData, applicationsData]);

    // Generate approved funds from applications data
    const approvedFunds: ApprovedFund[] = React.useMemo(() => {
        if (!applicationsData) return [];

        const fundsByBenefit = new Map<string, ApprovedFund>();

        applicationsData.forEach(app => {
            if (app.status.name === 'APPROVED') {
                const benefitName = app.benefit.name;
                const existing = fundsByBenefit.get(benefitName);
                
                if (existing) {
                    existing.amount += 1000.00; // Add to existing fund
                } else {
                    fundsByBenefit.set(benefitName, {
                        id: `fund-${benefitName.replace(/\s+/g, '-').toLowerCase()}`,
                        name: `${benefitName} Fund`,
                        amount: 1000.00,
                        dateApproved: app.createdAt,
                        benefitType: benefitName,
                        category: app.category?.name || 'Regular senior citizens'
                    });
                }
            }
        });

        return Array.from(fundsByBenefit.values()).sort((a, b) => b.amount - a.amount);
    }, [applicationsData]);

    // Calculate financial metrics
    const currentBalance = React.useMemo(() => {
        return transactions.reduce((balance, transaction) => {
            if (transaction.type === 'released') {
                return balance - transaction.amount; // Released funds reduce balance
            } else {
                return balance + transaction.amount; // Pending funds are allocated
            }
        }, 0); // Starting balance
    }, [transactions]);

    const totalReleased = React.useMemo(() => {
        return transactions
            .filter(t => t.type === 'released')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    const totalPending = React.useMemo(() => {
        return transactions
            .filter(t => t.type === 'pending')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    const handleAddTransaction = (newTransaction: FinancialTransaction) => {
        // In a real implementation, this would make an API call to create the transaction
        console.log('Adding new transaction:', newTransaction);
        // For now, we'll just close the dialog since we're using real data
        setIsAddTransactionDialogOpen(false);
    }

    const isLoading = seniorsLoading || applicationsLoading;

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent lg:h-[--nav-height] lg:px-6">
                        <h1 className="text-2xl font-semibold">Government Fund</h1>
                    </header>
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        <div className="text-center py-10 text-gray-500 flex items-center justify-center">
                            <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading financial data...
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
                        <h1 className="text-2xl font-semibold">Government Fund</h1>
                        <div className="flex gap-2">
                            <ReportGenerator
                                reportTitle="Staff Government Fund Overview"
                                data={transactions}
                                reportType="financial-overview"
                                timePeriod="monthly"
                                selectedPeriod={new Date().toISOString().slice(0, 7)}
                                variant="outline"
                                size="sm"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Report
                            </ReportGenerator>
                            <ReportGenerator
                                reportTitle="Staff Government Fund Analysis"
                                data={applicationsData || []}
                                reportType="government-fund"
                                timePeriod="monthly"
                                selectedPeriod={new Date().toISOString().slice(0, 7)}
                                variant="default"
                                size="sm"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Generate Fund Report
                            </ReportGenerator>
                        </div>
                    </div>
                </header>

                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
                        {/* Overview Cards */}
                        <div className="grid gap-4 sm:grid-cols-3 md:gap-8">
                            <OverviewCard
                                title="Current Balance"
                                value={`₱${currentBalance.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                                description="The current available funds."
                                icon={() => (
                                    <span className="text-l text-green-600">₱</span>
                                )}
                            />

                            <OverviewCard
                                title="Total Released"
                                value={`₱${totalReleased.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                                description="Total funds released to beneficiaries."
                                icon={ArrowUpCircle}
                                iconColor="text-green-600"
                            />
                            <OverviewCard
                                title="Total Pending"
                                value={`₱${totalPending.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                                description="Total funds allocated but not yet released."
                                icon={ArrowDownCircle}
                                iconColor="text-orange-600"
                            />
                        </div>

                        {/* Tabs Section */}
                        <Tabs defaultValue="disbursement-history" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="approved-funds">Approved Funds</TabsTrigger>
                                <TabsTrigger value="remaining-balance">Remaining Balance</TabsTrigger>
                                <TabsTrigger value="disbursement-history">Disbursement History</TabsTrigger>
                            </TabsList>

                            {/* Approved Funds Tab Content */}
                            <TabsContent value="approved-funds">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="grid gap-2">
                                            <CardTitle>Approved Funds</CardTitle>
                                            <CardDescription>
                                                Details of funds that have been officially approved based on benefit applications.
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <ReportGenerator
                                                reportTitle="Staff Approved Funds Report"
                                                data={approvedFunds}
                                                reportType="government-fund"
                                                variant="outline"
                                                size="sm"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Generate Report
                                            </ReportGenerator>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Fund Name</TableHead>
                                                        <TableHead>Benefit Type</TableHead>
                                                        <TableHead>Category</TableHead>
                                                        <TableHead className="text-right">Amount Approved</TableHead>
                                                        <TableHead>Date Approved</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {approvedFunds.length > 0 ? (
                                                        approvedFunds.map((fund) => (
                                                            <TableRow key={fund.id}>
                                                                <TableCell className="font-medium">{fund.name}</TableCell>
                                                                <TableCell>{fund.benefitType}</TableCell>
                                                                <TableCell>{fund.category}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {`₱${fund.amount.toLocaleString('en-PH', {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    })}`}
                                                                </TableCell>
                                                                <TableCell>{formatDateOnly(fund.dateApproved)}</TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="h-24 text-center">
                                                                No approved funds found.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Remaining Balance Tab Content */}
                            <TabsContent value="remaining-balance">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="grid gap-2">
                                            <CardTitle>Remaining Balance Overview</CardTitle>
                                            <CardDescription>
                                                Current financial status and fund allocation breakdown.
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <ReportGenerator
                                                reportTitle="Staff Balance Overview Report"
                                                data={[{
                                                    currentBalance,
                                                    totalReleased,
                                                    totalPending,
                                                    totalAllocated: totalReleased + totalPending
                                                }]}
                                                reportType="financial-overview"
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Export Balance Report
                                            </ReportGenerator>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-6">
                                            <div className="text-center">
                                                <p className="text-4xl font-bold text-primary mb-2">
                                                    {`₱${currentBalance.toLocaleString('en-PH', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}`}
                                                </p>
                                                <p className="text-lg text-muted-foreground">Current Available Balance</p>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 border rounded-lg text-center">
                                                    <h3 className="text-sm font-medium text-muted-foreground">Total Allocated</h3>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        ₱{(totalReleased + totalPending).toLocaleString('en-PH')}
                                                    </p>
                                                </div>
                                                <div className="p-4 border rounded-lg text-center">
                                                    <h3 className="text-sm font-medium text-muted-foreground">Released</h3>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        ₱{totalReleased.toLocaleString('en-PH')}
                                                    </p>
                                                </div>
                                                <div className="p-4 border rounded-lg text-center">
                                                    <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
                                                    <p className="text-2xl font-bold text-orange-600">
                                                        ₱{totalPending.toLocaleString('en-PH')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Disbursement History Tab Content */}
                            <TabsContent value="disbursement-history">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="grid gap-2">
                                            <CardTitle>Disbursement History</CardTitle>
                                            <CardDescription>
                                                Detailed log of all funds released and pending disbursements to beneficiaries.
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <ReportGenerator
                                                reportTitle="Staff Disbursement History Report"
                                                data={transactions}
                                                reportType="financial-overview"
                                                variant="outline"
                                                size="sm"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Export History
                                            </ReportGenerator>
                                            <Button onClick={() => setIsAddTransactionDialogOpen(true)}>
                                                Add New Transaction
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <TransactionList transactions={transactions} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
            <AddTransactionDialog
                isOpen={isAddTransactionDialogOpen}
                onClose={() => setIsAddTransactionDialogOpen(false)}
                onAddTransaction={handleAddTransaction}
            />
        </div>
    )
}

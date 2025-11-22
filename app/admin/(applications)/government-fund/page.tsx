// app/admin/applications/government-fund/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpCircle, ArrowDownCircle, FileText, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OverviewCard } from '@/components/financial-monitoring/overview-card'
import { TransactionList } from '@/components/financial-monitoring/transaction-list'
import { AddTransactionDialog } from '@/components/financial-monitoring/add-transaction-dialog'
import { AddFundDialog } from '@/components/financial-monitoring/add-fund-dialog'
import { FundHistoryList } from '@/components/financial-monitoring/fund-history-list'
import { ReportGenerator } from '@/components/reports/ReportGenerator'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/lib/axios'
import { Seniors } from '@/types/seniors'
import { BenefitApplicationData } from '@/types/application'

export type FinancialTransaction = {
    id: string;
    date: string;
    benefits: string;
    amount: number;
    type: 'released' | 'pending';
    category: string;
    seniorName?: string;
    barangay?: string;
    description?: string;
}

export type ApprovedFund = {
    id: string;
    name: string;
    amount: number;
    dateApproved: string;
    benefitType: string;
    category: string;
}

type TransactionFromDB = {
    id: number;
    date: Date | string;
    benefits: string;
    description: string;
    amount: number;
    type: 'released' | 'pending';
    category: string;
    seniorName: string | null;
    barangay: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type FundHistoryRecord = {
    id: number;
    date: string | Date;
    amount: number;
    from: string;
    description?: string | null;
    receiptPath?: string | null;
    receiptUrl?: string | null;
    previousBalance: number;
    newBalance: number;
    createdAt: Date;
    updatedAt: Date;
}

export default function GovernmentFundPage() {
    const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false)
    const [isAddFundDialogOpen, setIsAddFundDialogOpen] = useState(false)

    const { data: seniorsData, isLoading: seniorsLoading } = useQuery<Seniors[]>({
        queryKey: ['seniors-financial'],
        queryFn: async () => {
            return await apiService.get<Seniors[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`);
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: applicationsData, isLoading: applicationsLoading } = useQuery<BenefitApplicationData[]>({
        queryKey: ['applications-financial'],
        queryFn: async () => {
            return await apiService.get<BenefitApplicationData[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application`);
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: dbTransactions, isLoading: dbTransactionsLoading } = useQuery<TransactionFromDB[]>({
        queryKey: ['transactions'],
        queryFn: async () => {
            return await apiService.get<TransactionFromDB[]>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions`
            );
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: fundData } = useQuery({
        queryKey: ['government-fund'],
        queryFn: async () => {
            return await apiService.get<{ id: number; currentBalance: number }>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/government-fund`
            );
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: fundHistory, isLoading: fundHistoryLoading } = useQuery<FundHistoryRecord[]>({
        queryKey: ['fund-history'],
        queryFn: async () => {
            return await apiService.get<FundHistoryRecord[]>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fund-history`
            );
        },
        staleTime: 5 * 60 * 1000,
    });

    const transactions: FinancialTransaction[] = React.useMemo(() => {
        const financialTransactions: FinancialTransaction[] = [];

        if (dbTransactions) {
            dbTransactions.forEach(tx => {
                financialTransactions.push({
                    id: tx.id.toString(),
                    date: tx.date instanceof Date ? tx.date.toISOString() : tx.date.toString(),
                    benefits: tx.benefits,
                    amount: tx.amount,
                    type: tx.type,
                    category: tx.category,
                    seniorName: tx.seniorName || undefined,
                    barangay: tx.barangay || undefined,
                    description: tx.description,
                });
            });
        }

        if (seniorsData) {
            seniorsData.forEach(senior => {
                if (senior.releasedAt && senior.Applications && senior.Applications.length > 0) {
                    const latestApp = senior.Applications[0];
                    financialTransactions.push({
                        id: `released-${senior.id}`,
                        date: senior.releasedAt.toString(),
                        benefits: latestApp.benefit.name,
                        amount: 1000.00,
                        type: 'released',
                        category: latestApp.category?.name || 'Regular senior citizens',
                        seniorName: `${senior.firstname} ${senior.lastname}`,
                        barangay: senior.barangay
                    });
                }
            });
        }

        if (applicationsData) {
            applicationsData.forEach(app => {
                if (app.status.name === 'PENDING' || app.status.name === 'APPROVED') {
                    financialTransactions.push({
                        id: `pending-${app.id}`,
                        date: app.createdAt,
                        benefits: app.benefit.name,
                        amount: 1000.00,
                        type: 'pending',
                        category: app.category?.name || 'Regular senior citizens',
                        seniorName: `${app.senior.firstname} ${app.senior.lastname}`,
                        barangay: 'N/A'
                    });
                }
            });
        }

        return financialTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [seniorsData, applicationsData, dbTransactions]);

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

    // Get the total fund balance from database (sum of all fund additions)
    const totalFundBalance = fundData?.currentBalance || 0;

    // Calculate available balance: Total Fund Balance - Total Released
    const availableBalance = React.useMemo(() => {
        return totalFundBalance - totalReleased;
    }, [totalFundBalance, totalReleased]);

    // Calculate fund history with running balances based on actual available balance
    const fundHistoryWithBalances = React.useMemo(() => {
        if (!fundHistory || fundHistory.length === 0) return [];

        // Sort by date descending (newest first)
        const sorted = [...fundHistory].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Calculate running balances from current available balance going backwards
        let runningBalance = availableBalance;
        
        return sorted.map((record, index) => {
            const previousBalance = runningBalance;
            const newBalance = runningBalance + record.amount;
            
            // Update running balance for next iteration (going backwards in time)
            runningBalance = newBalance;

            return {
                ...record,
                previousBalance: previousBalance,
                newBalance: newBalance,
            };
        }).reverse(); // Reverse to show oldest first in the table
    }, [fundHistory, availableBalance]);

    const handleAddTransaction = (newTransaction: FinancialTransaction) => {
        console.log('Transaction added:', newTransaction);
        setIsAddTransactionDialogOpen(false);
    }

    const isLoading = seniorsLoading || applicationsLoading || dbTransactionsLoading;

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
                                reportTitle="Government Fund Overview"
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
                                reportTitle="Government Fund Analysis"
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
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl text-green-600">₱</span>
                                        {/* <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => setIsAddFundDialogOpen(true)}
                                            title="Add Fund"
                                        >
                                            <Plus className="h-4 w-4 text-green-600" />
                                        </Button> */}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {`₱${availableBalance.toLocaleString('en-PH', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}`}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Fund: ₱{totalFundBalance.toLocaleString('en-PH')} - Released: ₱{totalReleased.toLocaleString('en-PH')}
                                    </p>
                                </CardContent>
                            </Card>

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
                        <Tabs defaultValue="fund-history" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="fund-history">Transaction History</TabsTrigger>
                                <TabsTrigger value="disbursement-history">Disbursement History</TabsTrigger>
                            </TabsList>

                            {/* Fund History Tab Content */}
                            <TabsContent value="fund-history">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="grid gap-2">
                                            <CardTitle>Fund Addition History</CardTitle>
                                            <CardDescription>
                                                Complete log of all government fund additions with running balances.
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={() => setIsAddFundDialogOpen(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Fund
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {fundHistoryLoading ? (
                                            <div className="text-center py-10 text-gray-500">
                                                Loading fund history...
                                            </div>
                                        ) : (
                                            <FundHistoryList fundHistory={fundHistoryWithBalances} />
                                        )}
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
                                                reportTitle="Disbursement History Report"
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
            <AddFundDialog
                isOpen={isAddFundDialogOpen}
                onClose={() => setIsAddFundDialogOpen(false)}
                currentBalance={availableBalance}
            />
        </div>
    )
}
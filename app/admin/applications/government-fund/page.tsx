// app\admin\applications\financial-monitoring\page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OverviewCard } from '@/components/financial-monitoring/overview-card'
import { TransactionList } from '@/components/financial-monitoring/transaction-list'
import { AddTransactionDialog } from '@/components/financial-monitoring/add-transaction-dialog'
import {
    staticTransactions,
    calculateBalance,
    calculateTotalIncome,
    calculateTotalExpenses,
    FinancialTransaction,
} from '@/lib/static-data/static-data'

// Import Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateOnly } from '@/utils/format';

export default function GovernmentFundPage() {
    const [transactions, setTransactions] = useState<FinancialTransaction[]>(staticTransactions)
    const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false)

    const currentBalance = calculateBalance(transactions)
    const totalIncome = calculateTotalIncome(transactions)
    const totalExpenses = calculateTotalExpenses(transactions)

    const handleAddTransaction = (newTransaction: FinancialTransaction) => {
        setTransactions((prevTransactions) =>
            [newTransaction, ...prevTransactions].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
        )
    }

    // Dummy data for tabs
    const dummyApprovedFunds = [
        { id: 'apv1', name: 'Annual Senior Citizen Grant', amount: 500000.00, dateApproved: '2025-01-15' },
        { id: 'apv2', name: 'Community Health Program Fund', amount: 250000.00, dateApproved: '2025-02-20' },
        { id: 'apv3', name: 'Livelihood Project Allocation', amount: 150000.00, dateApproved: '2025-03-10' },
    ];


    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent lg:h-[--nav-height] lg:px-6">
                    <h1 className="text-2xl font-semibold">Government Fund</h1>
                </header>

                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3"> {/* Changed to col-span-3 to make tabs wider */}
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
                                value={`PHP ${totalIncome.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                                description="Total funds received this period."
                                icon={ArrowUpCircle}
                                iconColor="text-green-600"
                            />
                            <OverviewCard
                                title="Total Unreleased"
                                value={`PHP ${totalExpenses.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                                description="Total funds disbursed this period."
                                icon={ArrowDownCircle}
                                iconColor="text-red-600"
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
                                    <CardHeader>
                                        <CardTitle>Approved Funds</CardTitle>
                                        <CardDescription>
                                            Details of funds that have been officially approved.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Fund Name</TableHead>
                                                        <TableHead className="text-right">Amount Approved</TableHead>
                                                        <TableHead>Date Approved</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {dummyApprovedFunds.length > 0 ? (
                                                        dummyApprovedFunds.map((fund) => (
                                                            <TableRow key={fund.id}>
                                                                <TableCell className="font-medium">{fund.name}</TableCell>
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
                                                            <TableCell colSpan={3} className="h-24 text-center">
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
                                    <CardHeader>
                                        <CardTitle>Remaining Balance Overview</CardTitle>
                                        <CardDescription>
                                            A quick summary of the current financial status.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-center">
                                        <p className="text-4xl font-bold text-primary mb-2">
                                            {`₱${currentBalance.toLocaleString('en-PH', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}`}
                                        </p>
                                        <p>This is your total current balance across all funds.</p>
                                        <p className="text-sm mt-2 text-gray-500">
                                            Individual fund balances and detailed breakdowns will be available here soon.
                                        </p>
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
                                                A detailed log of all funds disbursed to beneficiaries or for expenses.
                                            </CardDescription>
                                        </div>
                                        <Button onClick={() => setIsAddTransactionDialogOpen(true)}>
                                            Add New Transaction
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Using the existing TransactionList component for consistency */}
                                        <TransactionList transactions={transactions} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Placeholder for future Charts/Analytics (moved to the right column, if needed, or removed if tabs take priority) */}
                    {/* You might want to adjust the grid layout if you keep this sidebar element */}
                    <div className="lg:col-span-1 hidden"> {/* Hidden for now, adjust grid as needed */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Summary</CardTitle>
                                <CardDescription>
                                    Quick insights into your financial health. (Future charts/graphs
                                    will go here)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
                                Coming Soon: Charts & Graphs
                            </CardContent>
                        </Card>
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
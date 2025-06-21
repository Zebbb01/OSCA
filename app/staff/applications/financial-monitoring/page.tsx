'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
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
} from '@/lib/static-data'

export default function FinancialMonitoringPage() {
    const [transactions, setTransactions] = useState<FinancialTransaction[]>(staticTransactions)
    const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false)

    const currentBalance = calculateBalance(transactions)
    const totalIncome = calculateTotalIncome(transactions)
    const totalExpenses = calculateTotalExpenses(transactions)

    const handleAddTransaction = (newTransaction: FinancialTransaction) => {
        // In a real application, you'd send this to an API
        setTransactions((prevTransactions) =>
            [newTransaction, ...prevTransactions].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent lg:h-[--nav-height] lg:px-6">
                    <h1 className="text-2xl font-semibold">Financial Monitoring</h1>
                </header>

                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
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
                                iconColor=""
                            />

                            <OverviewCard
                                title="Total Income"
                                value={`PHP ${totalIncome.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                                description="Total funds received this period."
                                icon={ArrowUpCircle}
                                iconColor="text-green-600"
                            />
                            <OverviewCard
                                title="Total Expenses"
                                value={`PHP ${totalExpenses.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                                description="Total funds disbursed this period."
                                icon={ArrowDownCircle}
                                iconColor="text-red-600"
                            />
                        </div>

                        {/* Transactions List */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="grid gap-2">
                                    <CardTitle>Recent Transactions</CardTitle>
                                    <CardDescription>
                                        A list of all financial inflows and outflows.
                                    </CardDescription>
                                </div>
                                <Button onClick={() => setIsAddTransactionDialogOpen(true)}>
                                    Add New Transaction
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <TransactionList transactions={transactions} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Placeholder for future Charts/Analytics */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Summary</CardTitle>
                                <CardDescription>
                                    Quick insights into your financial health. (Future charts/graphs
                                    will go here)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
                                {/* Example: Add a BarChart or PieChart here */}
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

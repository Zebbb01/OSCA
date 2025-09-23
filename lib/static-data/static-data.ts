// lib\static-data.ts

export type TransactionType = 'released' | 'pending';

export interface FinancialTransaction {
    id: string;
    date: string; // YYYY-MM-DD format for easy sorting and display
    benefits: string;
    amount: number;
    type: TransactionType;
    category: string;
    seniorName?: string;
    barangay?: string;
}

export const staticTransactions: FinancialTransaction[] = [
    {
        id: '1',
        date: '2025-06-01',
        benefits: 'Monthly Pension - Regular Senior',
        amount: 1000.00,
        type: 'released',
        category: 'Regular senior citizens',
    },
    {
        id: '2',
        date: '2025-06-02',
        benefits: 'Grant for Special Assistance Case',
        amount: 1000.00,
        type: 'released', // Changed to released
        category: 'Special assistance cases',
    },
    {
        id: '3',
        date: '2025-06-03',
        benefits: 'Social Security Payout - Regular Senior',
        amount: 1000.00,
        type: 'released',
        category: 'Regular senior citizens',
    },
    {
        id: '4',
        date: '2025-06-04',
        benefits: 'Donation for Special Assistance Fund',
        amount: 1000.00,
        type: 'released', // Changed to released
        category: 'Special assistance cases',
    },
    {
        id: '5',
        date: '2025-06-05',
        benefits: 'Medical Reimbursement - Regular Senior',
        amount: 1000.00,
        type: 'released', // Changed to released
        category: 'Regular senior citizens',
    },
    {
        id: '6',
        date: '2025-06-06',
        benefits: 'Direct Aid - Special Assistance Case',
        amount: 1000.00,
        type: 'pending',
        category: 'Special assistance cases',
    },
    {
        id: '7',
        date: '2025-06-07',
        benefits: 'Community Fund - Regular Senior',
        amount: 1000.00,
        type: 'released',
        category: 'Regular senior citizens',
    },
    {
        id: '8',
        date: '2025-06-08',
        benefits: 'Emergency Support - Special Assistance',
        amount: 1000.00,
        type: 'pending',
        category: 'Special assistance cases',
    },
    {
        id: '9',
        date: '2025-06-09',
        benefits: 'Retirement Benefit - Regular Senior',
        amount: 1000.00,
        type: 'released',
        category: 'Regular senior citizens',
    },
    {
        id: '10',
        date: '2025-06-10',
        benefits: 'One-time Assistance - Special Case',
        amount: 1000.00,
        type: 'pending',
        category: 'Special assistance cases',
    },
];

// Helper function to calculate current balance from static data
export const calculateBalance = (transactions: FinancialTransaction[]): number => {
    let balance = 0;
    transactions.forEach(transaction => {
        if (transaction.type === 'released') {
            balance += transaction.amount;
        } else {
            balance -= transaction.amount;
        }
    });
    return balance;
};

// Helper function to calculate total income
export const calculateTotalIncome = (transactions: FinancialTransaction[]): number => {
    return transactions
        .filter(t => t.type === 'released')
        .reduce((sum, t) => sum + t.amount, 0);
};

// Helper function to calculate total expenses
export const calculateTotalExpenses = (transactions: FinancialTransaction[]): number => {
    return transactions
        .filter(t => t.type === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);
};

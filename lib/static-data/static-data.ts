// lib\static-data.ts

export type TransactionType = 'release' | 'not released';

export interface FinancialTransaction {
    id: string;
    date: string; // YYYY-MM-DD format for easy sorting and display
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
}

export const staticTransactions: FinancialTransaction[] = [
    {
        id: '1',
        date: '2025-06-01',
        description: 'Monthly Pension - Regular Senior',
        amount: 1000.00,
        type: 'release',
        category: 'Regular senior citizens',
    },
    {
        id: '2',
        date: '2025-06-02',
        description: 'Grant for Special Assistance Case',
        amount: 1000.00,
        type: 'release', // Changed to release
        category: 'Special assistance cases',
    },
    {
        id: '3',
        date: '2025-06-03',
        description: 'Social Security Payout - Regular Senior',
        amount: 1000.00,
        type: 'release',
        category: 'Regular senior citizens',
    },
    {
        id: '4',
        date: '2025-06-04',
        description: 'Donation for Special Assistance Fund',
        amount: 1000.00,
        type: 'release', // Changed to release
        category: 'Special assistance cases',
    },
    {
        id: '5',
        date: '2025-06-05',
        description: 'Medical Reimbursement - Regular Senior',
        amount: 1000.00,
        type: 'release', // Changed to release
        category: 'Regular senior citizens',
    },
    {
        id: '6',
        date: '2025-06-06',
        description: 'Direct Aid - Special Assistance Case',
        amount: 1000.00,
        type: 'not released', // Kept as not released
        category: 'Special assistance cases',
    },
    {
        id: '7',
        date: '2025-06-07',
        description: 'Community Fund - Regular Senior',
        amount: 1000.00,
        type: 'release',
        category: 'Regular senior citizens',
    },
    {
        id: '8',
        date: '2025-06-08',
        description: 'Emergency Support - Special Assistance',
        amount: 1000.00,
        type: 'not released', // Kept as not released
        category: 'Special assistance cases',
    },
    {
        id: '9',
        date: '2025-06-09',
        description: 'Retirement Benefit - Regular Senior',
        amount: 1000.00,
        type: 'release',
        category: 'Regular senior citizens',
    },
    {
        id: '10',
        date: '2025-06-10',
        description: 'One-time Assistance - Special Case',
        amount: 1000.00,
        type: 'not released', // Kept as not released
        category: 'Special assistance cases',
    },
];

// Helper function to calculate current balance from static data
export const calculateBalance = (transactions: FinancialTransaction[]): number => {
    let balance = 0;
    transactions.forEach(transaction => {
        if (transaction.type === 'release') {
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
        .filter(t => t.type === 'release')
        .reduce((sum, t) => sum + t.amount, 0);
};

// Helper function to calculate total expenses
export const calculateTotalExpenses = (transactions: FinancialTransaction[]): number => {
    return transactions
        .filter(t => t.type === 'not released')
        .reduce((sum, t) => sum + t.amount, 0);
};
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

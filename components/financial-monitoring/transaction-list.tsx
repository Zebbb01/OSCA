// components/financial-monitoring/transaction-list.tsx
'use client';

import * as React from 'react';
import { 
    ColumnDef, 
    SortingState, 
    flexRender, 
    getCoreRowModel, 
    getSortedRowModel, 
    useReactTable,
    ColumnFiltersState,
    getFilteredRowModel,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateOnly } from '@/utils/format';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/axios';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the FinancialTransaction type locally
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

interface TransactionListProps {
    transactions: FinancialTransaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [transactionToDelete, setTransactionToDelete] = React.useState<string | null>(null);
    const queryClient = useQueryClient();

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (transactionId: string) => {
            // Only delete if it's a numeric ID (from database)
            if (!isNaN(Number(transactionId))) {
                await apiService.delete(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions?transaction_id=${transactionId}`
                );
            } else {
                throw new Error('Cannot delete derived transactions');
            }
        },
        onSuccess: () => {
            toast.success('Transaction deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setDeleteDialogOpen(false);
            setTransactionToDelete(null);
        },
        onError: (error: any) => {
            console.error('Error deleting transaction:', error);
            toast.error(error.message || 'Failed to delete transaction');
        },
    });

    const handleDeleteClick = (transactionId: string) => {
        setTransactionToDelete(transactionId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (transactionToDelete) {
            deleteMutation.mutate(transactionToDelete);
        }
    };

    const columns: ColumnDef<FinancialTransaction>[] = [
        {
            accessorKey: 'date',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => formatDateOnly(new Date(row.original.date)),
        },
        {
            accessorKey: 'benefits',
            header: 'Benefits',
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate">
                    {row.getValue('benefits')}
                </div>
            ),
        },
        {
            accessorKey: 'seniorName',
            header: 'Senior Name',
            cell: ({ row }) => {
                const seniorName = row.original.seniorName || row.original.description;
                return (
                    <div className="max-w-[180px] truncate">
                        {seniorName || 'N/A'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => (
                <div className="max-w-[150px] truncate">
                    {row.getValue('category')}
                </div>
            ),
        },
        {
            accessorKey: 'type',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    >
                        Type
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const type = row.getValue('type') as string;
                return (
                    <span className={`font-medium ${type === 'released' ? 'text-green-600' : 'text-orange-600'}`}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                );
            },
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => {
                return (
                    <div className="text-right">
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            Amount
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('amount'));
                const type = row.getValue('type') as string;
                const formatted = new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                }).format(amount);

                return (
                    <div className={`text-right font-medium ${type === 'released' ? 'text-green-600' : 'text-orange-600'}`}>
                        {formatted}
                    </div>
                );
            },
        },
        // {
        //     id: 'actions',
        //     header: () => <div className="text-right">Actions</div>,
        //     cell: ({ row }) => {
        //         const transaction = row.original;
        //         // Only allow deletion of database transactions (numeric IDs)
        //         const isDeletable = !isNaN(Number(transaction.id));
                
        //         return (
        //             <div className="text-right">
        //                 {isDeletable ? (
        //                     <Button
        //                         variant="ghost"
        //                         size="sm"
        //                         onClick={() => handleDeleteClick(transaction.id)}
        //                         className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        //                     >
        //                         <Trash2 className="h-4 w-4" />
        //                     </Button>
        //                 ) : (
        //                     <span className="text-xs text-muted-foreground">Auto</span>
        //                 )}
        //             </div>
        //         );
        //     },
        // },
    ];

    const table = useReactTable({
        data: transactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <div className="space-y-4">
            {/* Search Filter */}
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search by benefits..."
                    value={(table.getColumn('benefits')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('benefits')?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <Input
                    placeholder="Search by senior name..."
                    value={(table.getColumn('seniorName')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('seniorName')?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                    Showing {table.getRowModel().rows.length} of {transactions.length} transaction(s)
                </div>
                <div className="flex gap-4">
                    <span>
                        Released: <span className="font-medium text-green-600">
                            {transactions.filter(t => t.type === 'released').length}
                        </span>
                    </span>
                    <span>
                        Pending: <span className="font-medium text-orange-600">
                            {transactions.filter(t => t.type === 'pending').length}
                        </span>
                    </span>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the transaction
                            from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
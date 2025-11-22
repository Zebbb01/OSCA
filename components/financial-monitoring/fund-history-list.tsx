// components/financial-monitoring/fund-history-list.tsx
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
import { ArrowUpDown, Trash2, Eye } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export type FundHistoryRecord = {
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

interface FundHistoryListProps {
    fundHistory: FundHistoryRecord[];
}

export function FundHistoryList({ fundHistory }: FundHistoryListProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [historyToDelete, setHistoryToDelete] = React.useState<number | null>(null);
    const [receiptDialogOpen, setReceiptDialogOpen] = React.useState(false);
    const [selectedReceipt, setSelectedReceipt] = React.useState<string | null>(null);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (historyId: number) => {
            await apiService.delete(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fund-history?history_id=${historyId}`
            );
        },
        onSuccess: () => {
            toast.success('Fund history deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['fund-history'] });
            queryClient.invalidateQueries({ queryKey: ['government-fund'] });
            setDeleteDialogOpen(false);
            setHistoryToDelete(null);
        },
        onError: (error: any) => {
            console.error('Error deleting fund history:', error);
            toast.error(error.message || 'Failed to delete fund history');
        },
    });

    const handleDeleteClick = (historyId: number) => {
        setHistoryToDelete(historyId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (historyToDelete) {
            deleteMutation.mutate(historyToDelete);
        }
    };

    const handleViewReceipt = (receiptUrl: string) => {
        setSelectedReceipt(receiptUrl);
        setReceiptDialogOpen(true);
    };

    const columns: ColumnDef<FundHistoryRecord>[] = [
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
            accessorKey: 'from',
            header: 'Source',
            cell: ({ row }) => (
                <div className="max-w-[180px] truncate font-medium">
                    {row.getValue('from')}
                </div>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => {
                const description = row.original.description;
                return (
                    <div className="max-w-[200px] truncate">
                        {description || 'N/A'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => {
                return (
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            Amount Added
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue('amount'));
                const formatted = new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                }).format(amount);

                return (
                    <div className="text-center font-medium text-green-600">
                        +{formatted}
                    </div>
                );
            },
        },
        // {
        //     accessorKey: 'previousBalance',
        //     header: () => <div className="text-center">Previous Balance</div>,
        //     cell: ({ row }) => {
        //         const balance = row.original.previousBalance;
        //         const formatted = new Intl.NumberFormat('en-PH', {
        //             style: 'currency',
        //             currency: 'PHP',
        //         }).format(balance);

        //         return (
        //             <div className="text-center text-gray-600">
        //                 {formatted}
        //             </div>
        //         );
        //     },
        // },
        // {
        //     accessorKey: 'newBalance',
        //     header: () => <div className="text-center">New Balance</div>,
        //     cell: ({ row }) => {
        //         const balance = row.original.newBalance;
        //         const formatted = new Intl.NumberFormat('en-PH', {
        //             style: 'currency',
        //             currency: 'PHP',
        //         }).format(balance);

        //         return (
        //             <div className="text-center font-semibold text-blue-600">
        //                 {formatted}
        //             </div>
        //         );
        //     },
        // },
        {
            id: 'actions',
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const record = row.original;
                
                return (
                    <div className="text-center flex justify-end gap-1">
                        {record.receiptUrl && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewReceipt(record.receiptUrl!)}
                                className="h-8 w-8 p-0"
                                title="View Receipt"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(record.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: fundHistory,
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
                    placeholder="Search by source..."
                    value={(table.getColumn('from')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('from')?.setFilterValue(event.target.value)
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
                                    No fund history found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                    Showing {table.getRowModel().rows.length} of {fundHistory.length} record(s)
                </div>
                <div>
                    Total Added: <span className="font-medium text-green-600">
                        ₱{fundHistory.reduce((sum, h) => sum + h.amount, 0).toLocaleString('en-PH')}
                    </span>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the fund record
                            and adjust the current balance accordingly.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setHistoryToDelete(null)}>
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

            {/* Receipt View Dialog */}
            <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Receipt/Proof</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center">
                        {selectedReceipt && (
                            <img
                                src={selectedReceipt}
                                alt="Receipt"
                                className="max-w-full max-h-[500px] object-contain"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
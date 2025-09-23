// components\financial-monitoring\transaction-list.tsx
'use client';

import * as React from 'react';
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FinancialTransaction } from '@/lib/static-data/static-data';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateOnly } from '@/utils/format';

interface TransactionListProps {
    transactions: FinancialTransaction[];
}

export const columns: ColumnDef<FinancialTransaction>[] = [
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
    },
    {
        accessorKey: 'category',
        header: 'Category',
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
                <span className={`font-medium ${type === 'released' ? 'text-green-600' : 'text-red-600'}`}>
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
                <div className={`text-right font-medium ${type === 'released' ? 'text-green-600' : 'text-red-600'}`}>
                    {formatted}
                </div>
            );
        },
    },
];

export function TransactionList({ transactions }: TransactionListProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const table = useReactTable({
        data: transactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
    });

    return (
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
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
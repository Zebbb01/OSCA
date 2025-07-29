'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FinancialTransaction, TransactionType } from '@/lib/static-data/static-data';
import { formatDateOnly } from '@/utils/format';

const addTransactionSchema = z.object({
    date: z.string().nonempty('Date is required'),
    description: z.string().nonempty('Description is required'),
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['income', 'expense'], { message: 'Type is required' }),
    category: z.string().nonempty('Category is required'),
});

type AddTransactionFormInputs = z.infer<typeof addTransactionSchema>;

interface AddTransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTransaction: (newTransaction: FinancialTransaction) => void;
}

export function AddTransactionDialog({ isOpen, onClose, onAddTransaction }: AddTransactionDialogProps) {
    const {
        register,
        handleSubmit,
        control, // Needed for Select component with React Hook Form
        setValue,
        formState: { errors },
        reset,
    } = useForm<AddTransactionFormInputs>({
        resolver: zodResolver(addTransactionSchema),
        defaultValues: {
            date: formatDateOnly(new Date()), // Default to today's date
            description: '',
            amount: undefined, // Use undefined for number inputs to start empty
            type: undefined,
            category: '',
        },
    });

    const onSubmit = (data: AddTransactionFormInputs) => {
        const newTransaction: FinancialTransaction = {
            id: uuidv4(), // Generate a unique ID
            ...data,
        };
        onAddTransaction(newTransaction);
        reset(); // Reset form fields
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new financial transaction.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            {...register('date')}
                            className="col-span-3"
                        />
                        {errors.date && <span className="col-span-4 text-right text-red-500 text-xs">{errors.date.message}</span>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Input
                            id="description"
                            {...register('description')}
                            className="col-span-3"
                        />
                        {errors.description && <span className="col-span-4 text-right text-red-500 text-xs">{errors.description.message}</span>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            {...register('amount', { valueAsNumber: true })} // Ensure it's treated as a number
                            className="col-span-3"
                        />
                        {errors.amount && <span className="col-span-4 text-right text-red-500 text-xs">{errors.amount.message}</span>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select onValueChange={(value: TransactionType) => setValue('type', value)} defaultValue={undefined}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.type && <span className="col-span-4 text-right text-red-500 text-xs">{errors.type.message}</span>}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Category
                        </Label>
                        <Input
                            id="category"
                            {...register('category')}
                            className="col-span-3"
                        />
                        {errors.category && <span className="col-span-4 text-right text-red-500 text-xs">{errors.category.message}</span>}
                    </div>

                    <DialogFooter>
                        <Button type="submit">Add Transaction</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
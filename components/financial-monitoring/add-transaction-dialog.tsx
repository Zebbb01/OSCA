// components/financial-monitoring/add-transaction-dialog.tsx
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
import { formatDateOnly } from '@/utils/format';
import { apiService } from '@/lib/axios';
import { Benefit } from '@/types/benefits';
import { Categories } from '@/types/seniors';
import { Seniors } from '@/types/seniors';

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

const addTransactionSchema = z.object({
    date: z.string().nonempty('Date is required'),
    benefits: z.string().nonempty('Benefits is required'),
    description: z.string().optional(),
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['released', 'pending'], { message: 'Type is required' }),
    category: z.string().nonempty('Category is required'),
    seniorName: z.string().optional(),
    barangay: z.string().optional(),
});

type AddTransactionFormInputs = z.infer<typeof addTransactionSchema>;

// Type for the database Transaction model
type TransactionFromDB = {
    id: number;
    date: Date;
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

interface AddTransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTransaction: (newTransaction: FinancialTransaction) => void;
}

export function AddTransactionDialog({ isOpen, onClose, onAddTransaction }: AddTransactionDialogProps) {
    const queryClient = useQueryClient();

    // Fetch benefits from API
    const { data: benefits, isLoading: benefitsLoading } = useQuery<Benefit[]>({
        queryKey: ['benefits'],
        queryFn: async () => {
            return await apiService.get<Benefit[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits`);
        },
        staleTime: 5 * 60 * 1000,
        enabled: isOpen,
    });

    // Fetch categories from API
    const { data: categories, isLoading: categoriesLoading } = useQuery<Categories[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            return await apiService.get<Categories[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`);
        },
        staleTime: 5 * 60 * 1000,
        enabled: isOpen,
    });

    // Fetch seniors from API for dropdown
    const { data: seniors, isLoading: seniorsLoading } = useQuery<Seniors[]>({
        queryKey: ['seniors'],
        queryFn: async () => {
            return await apiService.get<Seniors[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`);
        },
        staleTime: 5 * 60 * 1000,
        enabled: isOpen,
    });

    // Updated mutation with correct typing
    const createTransactionMutation = useMutation<
        TransactionFromDB,
        Error,
        AddTransactionFormInputs
    >({
        mutationFn: async (data: AddTransactionFormInputs) => {
            const response = await apiService.post<TransactionFromDB>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/transactions`,
                {
                    date: data.date,
                    benefits: data.benefits,
                    description: data.description,
                    amount: data.amount,
                    type: data.type,
                    category: data.category,
                    seniorName: data.seniorName || null,
                    barangay: data.barangay || null,
                }
            );
            return response;
        },
        onSuccess: (transaction) => {
            toast.success('Transaction added successfully');
            
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['seniors-financial'] });
            queryClient.invalidateQueries({ queryKey: ['applications-financial'] });
            
            // Format the transaction to match FinancialTransaction type
            const newTransaction: FinancialTransaction = {
                id: transaction.id.toString(),
                date: transaction.date instanceof Date 
                    ? transaction.date.toISOString() 
                    : String(transaction.date),
                benefits: transaction.benefits,
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                seniorName: transaction.seniorName || undefined,
                barangay: transaction.barangay || undefined,
                description: transaction.description,
            };
            
            // Call the parent callback
            onAddTransaction(newTransaction);
            
            // Reset and close
            reset();
            onClose();
        },
        onError: (error: any) => {
            console.error('Error creating transaction:', error);
            toast.error(error.message || 'Failed to add transaction');
        },
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<AddTransactionFormInputs>({
        resolver: zodResolver(addTransactionSchema),
        defaultValues: {
            date: formatDateOnly(new Date()),
            benefits: '',
            description: '',
            amount: 1000,
            type: undefined,
            category: '',
            seniorName: '',
            barangay: '',
        },
    });

    // Watch the selected senior to auto-fill barangay
    const selectedSeniorName = watch('seniorName');

    React.useEffect(() => {
        if (selectedSeniorName && seniors) {
            const senior = seniors.find(s => 
                `${s.firstname} ${s.lastname}` === selectedSeniorName
            );
            if (senior) {
                setValue('barangay', senior.barangay);
            }
        }
    }, [selectedSeniorName, seniors, setValue]);

    const onSubmit = (data: AddTransactionFormInputs) => {
        createTransactionMutation.mutate(data);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const isSubmitting = createTransactionMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new financial transaction.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    {/* Date Field */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            {...register('date')}
                            className="col-span-3"
                            disabled={isSubmitting}
                        />
                        {errors.date && (
                            <span className="col-span-4 text-right text-red-500 text-xs">
                                {errors.date.message}
                            </span>
                        )}
                    </div>

                    {/* Benefits Dropdown */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="benefits" className="text-right">
                            Benefits <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            name="benefits"
                            control={control}
                            render={({ field }) => (
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                    disabled={benefitsLoading || isSubmitting}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={benefitsLoading ? "Loading benefits..." : "Select benefit"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {benefits && benefits.length > 0 ? (
                                            benefits.map((benefit) => (
                                                <SelectItem key={benefit.id} value={benefit.name}>
                                                    {benefit.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-benefits" disabled>
                                                No benefits available
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.benefits && (
                            <span className="col-span-4 text-right text-red-500 text-xs">
                                {errors.benefits.message}
                            </span>
                        )}
                    </div>

                    {/* Senior Name Dropdown */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="seniorName" className="text-right">
                            Senior Name
                        </Label>
                        <Controller
                            name="seniorName"
                            control={control}
                            render={({ field }) => (
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                    disabled={seniorsLoading || isSubmitting}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={seniorsLoading ? "Loading seniors..." : "Select senior (optional)"} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                        <SelectItem value="none">None</SelectItem>
                                        {seniors && seniors.length > 0 ? (
                                            seniors.map((senior) => (
                                                <SelectItem 
                                                    key={senior.id} 
                                                    value={`${senior.firstname} ${senior.lastname}`}
                                                >
                                                    {senior.firstname} {senior.lastname} - {senior.barangay}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-seniors" disabled>
                                                No seniors available
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.seniorName && (
                            <span className="col-span-4 text-right text-red-500 text-xs">
                                {errors.seniorName.message}
                            </span>
                        )}
                    </div>

                    {/* Barangay Field (Auto-filled from senior) */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="barangay" className="text-right">
                            Barangay
                        </Label>
                        <Input
                            id="barangay"
                            {...register('barangay')}
                            className="col-span-3"
                            placeholder="Auto-filled from senior"
                            disabled={isSubmitting}
                            readOnly
                        />
                    </div>

                    {/* Description Field */}
                    {/* <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="description"
                            {...register('description')}
                            className="col-span-3"
                            placeholder="Transaction details or notes"
                            disabled={isSubmitting}
                        />
                        {errors.description && (
                            <span className="col-span-4 text-right text-red-500 text-xs">
                                {errors.description.message}
                            </span>
                        )}
                    </div> */}

                    {/* Amount Field */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount <span className="text-red-500">*</span>
                        </Label>
                        <div className="col-span-3 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">₱</span>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                {...register('amount', { valueAsNumber: true })}
                                className="pl-7"
                                placeholder="1000.00"
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.amount && (
                            <span className="col-span-4 text-right text-red-500 text-xs">
                                {errors.amount.message}
                            </span>
                        )}
                    </div>

                    {/* Category Dropdown */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Category <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                    disabled={categoriesLoading || isSubmitting}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories && categories.length > 0 ? (
                                            categories.map((category) => (
                                                <SelectItem key={category.id} value={category.name}>
                                                    {category.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-categories" disabled>
                                                No categories available
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.category && (
                            <span className="col-span-4 text-right text-red-500 text-xs">
                                {errors.category.message}
                            </span>
                        )}
                    </div>

                    {/* Type Dropdown */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="released">Released</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.type && (
                            <span className="col-span-4 text-right text-red-500 text-xs">
                                {errors.type.message}
                            </span>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={benefitsLoading || categoriesLoading || seniorsLoading || isSubmitting}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Transaction'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
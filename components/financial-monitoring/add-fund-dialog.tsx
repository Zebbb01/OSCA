// components/financial-monitoring/add-fund-dialog.tsx
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { formatDateOnly } from '@/utils/format';
import { apiService } from '@/lib/axios';

const addFundSchema = z.object({
    date: z.string().nonempty('Date is required'),
    amount: z.number().positive('Amount must be positive'),
    from: z.string().nonempty('Source is required'),
    description: z.string().optional(),
    receipt: z.instanceof(File).optional(),
});

type AddFundFormInputs = z.infer<typeof addFundSchema>;

interface AddFundDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number; // This is now the available balance (Total Fund - Released)
}

export function AddFundDialog({ isOpen, onClose, currentBalance }: AddFundDialogProps) {
    const queryClient = useQueryClient();
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const addFundMutation = useMutation({
        mutationFn: async (data: FormData) => {
            return await apiService.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fund-history`,
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
        },
        onSuccess: () => {
            toast.success('Fund added successfully');
            queryClient.invalidateQueries({ queryKey: ['government-fund'] });
            queryClient.invalidateQueries({ queryKey: ['fund-history'] });
            queryClient.invalidateQueries({ queryKey: ['seniors-financial'] });
            queryClient.invalidateQueries({ queryKey: ['applications-financial'] });
            reset();
            setPreviewImage(null);
            onClose();
        },
        onError: (error: any) => {
            console.error('Error adding fund:', error);
            toast.error(error.message || 'Failed to add fund');
        },
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<AddFundFormInputs>({
        resolver: zodResolver(addFundSchema),
        defaultValues: {
            date: formatDateOnly(new Date()),
            amount: 0,
            from: '',
            description: '',
        },
    });

    const receiptFile = watch('receipt');
    const amount = watch('amount');

    React.useEffect(() => {
        if (receiptFile && receiptFile instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(receiptFile);
        } else {
            setPreviewImage(null);
        }
    }, [receiptFile]);

    const onSubmit = async (data: AddFundFormInputs) => {
        const formData = new FormData();
        formData.append('date', data.date);
        formData.append('amount', data.amount.toString());
        formData.append('from', data.from);
        formData.append('description', data.description || '');
        formData.append('availableBalance', currentBalance.toString()); // Send available balance
        
        if (data.receipt) {
            formData.append('receipt', data.receipt);
        }

        addFundMutation.mutate(formData);
    };

    const handleClose = () => {
        reset();
        setPreviewImage(null);
        onClose();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setValue('receipt', file);
        }
    };

    const handleRemoveFile = () => {
        setValue('receipt', undefined);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Calculate the new balance preview
    const newBalancePreview = currentBalance + (amount || 0);

    const isSubmitting = addFundMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Government Fund</DialogTitle>
                    <DialogDescription>
                        Record a new fund addition with receipt/proof of transaction.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    {/* Balance Preview */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Current Available Balance</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    ₱{currentBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">New Available Balance</p>
                                <p className="text-lg font-semibold text-green-600">
                                    ₱{newBalancePreview.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>

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
                                placeholder="50000.00"
                                disabled={isSubmitting}
                            />
                        </div>
                        {errors.amount && (
                            <span className="col-span-4 text-right text-red-500 text-xs">
                                {errors.amount.message}
                            </span>
                        )}
                    </div>

                    {/* From/Source Field */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="from" className="text-right">
                            From <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="from"
                            {...register('from')}
                            className="col-span-3"
                            placeholder="e.g., National Government, City Budget"
                            disabled={isSubmitting}
                        />
                        {errors.from && (
                            <span className="col-span-4 text-right text-red-500 text-xs">
                                {errors.from.message}
                            </span>
                        )}
                    </div>

                    {/* Description Field */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="description" className="text-right pt-2">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            className="col-span-3"
                            placeholder="Additional notes or details about this fund addition"
                            rows={3}
                            disabled={isSubmitting}
                        />
                        {errors.description && (
                            <span className="col-span-4 text-right text-red-500 text-xs">
                                {errors.description.message}
                            </span>
                        )}
                    </div>

                    {/* Receipt/Proof Upload */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="receipt" className="text-right pt-2">
                            Receipt/Proof
                        </Label>
                        <div className="col-span-3 space-y-2">
                            {!previewImage ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                >
                                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm text-gray-600">
                                        Click to upload receipt or proof
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        PNG, JPG up to 5MB
                                    </p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={previewImage}
                                        alt="Receipt preview"
                                        className="w-full h-48 object-contain border rounded-lg"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8"
                                        onClick={handleRemoveFile}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isSubmitting}
                            />
                            {errors.receipt && (
                                <span className="text-red-500 text-xs">
                                    {errors.receipt.message}
                                </span>
                            )}
                        </div>
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
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Fund'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
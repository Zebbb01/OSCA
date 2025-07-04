'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Pencil, CalendarDays, CheckCircle2 } from 'lucide-react'; // Import relevant icons
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
    ApplicationEditDialogProps,
    ApplicationUpdateData,
    ApplicationWithDetails // Your new types
} from '@/types/applications'; // Adjust path if needed

import { EditableDateFieldProps, EditableSelectFieldProps, SectionHeaderProps } from '@/types/seniors'; // Re-use from senior types
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Assuming TanStack Query for mutations
import { toast } from 'sonner'; // Assuming you use sonner for toasts
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Re-usable components from SeniorEditDialog for consistency
const EditableDateField: React.FC<EditableDateFieldProps> = ({
    label,
    id,
    value,
    onChange,
    placeholder = 'MM/DD/YYYY',
}) => (
    <div>
        <Label htmlFor={id}>{label}</Label>
        <DatePicker
            selected={value}
            onChange={onChange}
            dateFormat={[
                'MM/dd/yyyy',
                'yyyy-MM-dd',
                'MMMM d, yyyy',
                'MMM d, yyyy',
                'MMMM dd, yyyy',
                'MMMM d, yyyy',
            ]}
            placeholderText={placeholder}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
    </div>
);

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, description }) => (
    <div className="pb-4 p-6">
        <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
    </div>
);

const EditableSelectField: React.FC<EditableSelectFieldProps> = ({
    label,
    id,
    value,
    onChange,
    options,
    placeholder = 'Select an option',
}) => (
    <div>
        <Label htmlFor={id}>{label}</Label>
        <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger id={id}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);


export const ApplicationEditDialog: React.FC<ApplicationEditDialogProps> = ({
    application,
    queryClient,
    trigger
}) => {
    const [open, setOpen] = React.useState(false);
    const [scheduledDate, setScheduledDate] = React.useState<Date | null>(
        application.scheduledDate ? new Date(application.scheduledDate) : null
    );
    const [statusId, setStatusId] = React.useState<number>(application.status_id);

    // Fetch available statuses for the select dropdown
    const { data: statuses, isLoading: isLoadingStatuses } = useQueryClient().getQueryData(['statuses']) || {}; // Assuming you have a query for statuses

    React.useEffect(() => {
        setScheduledDate(application.scheduledDate ? new Date(application.scheduledDate) : null);
        setStatusId(application.status_id);
    }, [application]);

    const updateApplicationMutation = useMutation({
        mutationFn: async (data: ApplicationUpdateData) => {
            const response = await fetch(`/api/benefits/application/${data.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to update application');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] }); // Invalidate applications query to refetch
            toast.success('Application updated successfully!');
            setOpen(false);
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
    });

    const handleUpdate = () => {
        const payload: ApplicationUpdateData = {
            id: application.id,
            scheduledDate: scheduledDate ? scheduledDate.toISOString() : undefined,
            status_id: statusId, // Include status update
        };
        updateApplicationMutation.mutate(payload);
    };

    const defaultTrigger = (
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md bg-background cursor-pointer text-sm ring-offset-background hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Pencil className="h-5 w-5 text-blue-600" />
        </Button>
    );

    const statusOptions = (statuses as any[] || []).map(s => ({ value: s.id.toString(), label: s.name }));


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Edit Application</DialogTitle>
                    <DialogDescription>
                        Update details for application ID: {application.id} (Senior: {application.senior.firstname} {application.senior.lastname})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 p-1">
                    {/* Scheduled Date Section */}
                    <div className="border rounded-lg">
                        <SectionHeader
                            icon={<CalendarDays className="h-5 w-5 text-purple-600" />}
                            title="Scheduled Date"
                            description="Adjust the scheduled date for this application."
                        />
                        <div className="px-6 pb-6 space-y-4">
                            <EditableDateField
                                label="Scheduled Date"
                                id="scheduledDate"
                                value={scheduledDate}
                                onChange={(date) => setScheduledDate(date)}
                                placeholder="MM/DD/YYYY"
                            />
                            {application.createdAt && (
                                <p className="text-sm text-gray-500">
                                    (Original Creation: {new Date(application.createdAt).toLocaleDateString()})
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Status Section */}
                    <div className="border rounded-lg">
                        <SectionHeader
                            icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
                            title="Application Status"
                            description="Change the current status of this application."
                        />
                        <div className="px-6 pb-6 space-y-4">
                            {isLoadingStatuses ? (
                                <p>Loading statuses...</p>
                            ) : (
                                <EditableSelectField
                                    label="Status"
                                    id="status"
                                    value={statusId.toString()} // Convert number to string for select
                                    onChange={(value) => setStatusId(parseInt(value, 10))}
                                    options={statusOptions}
                                    placeholder="Select application status"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        onClick={handleUpdate}
                        disabled={updateApplicationMutation.isPending}
                    >
                        {updateApplicationMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
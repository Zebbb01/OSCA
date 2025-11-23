// components/senior-citizen/registerForm/components/ContactAddress.tsx
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { MapPin, Phone } from 'lucide-react'
import { SeniorsFormData } from '@/schema/seniors/seniors.schema'
import { SELECT_OPTIONS } from '@/constants/select-options'

// shadcn/ui components
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils' // Assuming you have a cn (classnames) utility from shadcn/ui

type ContactAddressProps = {
    handleNumberInputChange: (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof SeniorsFormData) => void;
}

const allowOnlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  if (allowedKeys.includes(e.key)) return;

  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
};


export const ContactAddress = ({ handleNumberInputChange }: ContactAddressProps) => {
    const form = useFormContext<SeniorsFormData>()

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Contact & Address</CardTitle>
                </div>
                <CardDescription>
                    Phone numbers and address information
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Phone Numbers Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field, fieldState }) => ( // Destructure fieldState to get error information
                            <FormItem>
                                <FormLabel>Contact Number</FormLabel>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        maxLength={11}
                                        placeholder="09123456789"
                                        {...field}
                                        onKeyDown={allowOnlyNumbers}
                                        onChange={(e) => {
                                            // Call the passed handler first
                                            handleNumberInputChange(e, 'contactNumber');
                                            // Then ensure react-hook-form's onChange is also called
                                            field.onChange(e);
                                        }}
                                        // Apply conditional classes using cn utility
                                        className={cn(
                                            fieldState.error && 'border-red-500 ring-red-500 focus-visible:ring-red-500', // Red border and ring on error
                                            fieldState.error && fieldState.error.type === 'server' && 'underline decoration-red-500 decoration-2' // Red underline specifically for server errors
                                        )}
                                    />
                                </FormControl>
                                <FormMessage /> {/* This will display the error message */}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="emergencyNumber"
                        render={({ field, fieldState }) => ( // Destructure fieldState to get error information
                            <FormItem>
                                <FormLabel>Emergency Contact</FormLabel>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        maxLength={11}
                                        placeholder="09123456789"
                                        {...field}
                                        onKeyDown={allowOnlyNumbers}
                                        onChange={(e) => {
                                            handleNumberInputChange(e, 'emergencyNumber');
                                            field.onChange(e);
                                        }}
                                        // Apply conditional classes using cn utility
                                        className={cn(
                                            fieldState.error && 'border-red-500 ring-red-500 focus-visible:ring-red-500', // Red border and ring on error
                                            fieldState.error && fieldState.error.type === 'server' && 'underline decoration-red-500 decoration-2' // Red underline specifically for server errors
                                        )}
                                    />
                                </FormControl>
                                <FormMessage /> {/* This will display the error message */}
                            </FormItem>
                        )}
                    />
                </div>

                {/* Contact Person Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Person</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text" 
                                        placeholder="Enter Contact Person"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactRelationship"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Relationship</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text" 
                                        placeholder="Enter Contact Relationship"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Address Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="purok"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lot / Block / Street / Purok</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text" // Changed from 'address' as it's not a standard HTML type
                                        placeholder="Enter purok"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="barangay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Barangay</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select barangay" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SELECT_OPTIONS.barangay.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
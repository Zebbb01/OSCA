// components\senior-citizen\registerForm\components\PersonalInformation.tsx
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { format } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { User } from 'lucide-react'
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

export const PersonalInformation = () => {
    const form = useFormContext<SeniorsFormData>()

    const calculateAgeFromBirthdate = (date: Date | null) => {
        if (!date) return 0;
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        const dayDiff = today.getDate() - date.getDate();

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age;
    };


    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                </div>
                <CardDescription>
                    Basic personal details and contact information
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Name Fields Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter first name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="middleName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Middle Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter middle name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name *</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter last name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Age, Birth Date, Gender Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={60}
                                        max={120}
                                        placeholder="Enter age"
                                        {...field}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            field.onChange(value);

                                            const num = parseInt(value, 10);
                                            if (!isNaN(num)) {
                                                const today = new Date();
                                                const birthYear = today.getFullYear() - num;
                                                const newBirthdate = new Date(
                                                    birthYear,
                                                    today.getMonth(),
                                                    today.getDate()
                                                );

                                                // update birthdate in form
                                                form.setValue("birthDate", format(newBirthdate, "MM/dd/yyyy"), {
                                                    shouldValidate: true,
                                                });
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Birth Date</FormLabel>
                                <FormControl>
                                    <DatePicker
                                        selected={
                                            field.value
                                                ? new Date(field.value)
                                                : null
                                        }
                                        onChange={(date: Date | null) => {
                                            const formatted = date ? format(date, 'MM/dd/yyyy') : '';

                                            // Save birthdate
                                            field.onChange(formatted);

                                            // Auto-update age field
                                            const age = calculateAgeFromBirthdate(date);
                                            form.setValue("age", age.toString(), { shouldValidate: true });
                                        }}
                                        dateFormat={[
                                            'MM/dd/yyyy',
                                            'yyyy-MM-dd',
                                            'MMMM d, yyyy',
                                            'MMM d, yyyy',
                                            'MMMM dd, yyyy',
                                            'MMMM d yyyy',
                                            'MM/dd/yyyy',
                                        ]}
                                        placeholderText="MM/DD/YYYY"
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SELECT_OPTIONS.gender.map((option) => (
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
                    {/* <FormField
                        control={form.control}
                        name="pwd"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Senior Citizen Category</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === 'true')}
                                    value={field.value ? 'true' : 'false'}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="false">
                                            Regular Senior Citizen
                                        </SelectItem>
                                        <SelectItem value="true">
                                            Special Cases
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> */}
                </div>
            </CardContent>
        </Card>
    )
}
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { RegistrationDocumentTag } from '@/types/seniors'
import { AlertDialogComponent } from '../alert-component'
import { SeniorsFormData, seniorsFormSchema } from '@/schema/seniors/seniors.schema'
import { apiService } from '@/lib/axios'
import { useMutation } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarIcon, Upload, User, MapPin, Phone, FileText, Loader2 } from 'lucide-react'
import { SELECT_OPTIONS } from '@/constants/select-options'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '../ui/checkbox'

type FileData = {
    birth_certificate: File | null
    certificate_of_residency: File | null
    government_issued_id: File | null
    membership_certificate: File | null
}


// Document upload configuration
const DOCUMENT_TYPES = [
    {
        key: 'birth_certificate',
        label: 'Birth Certificate',
        tag: RegistrationDocumentTag.BIRTH_CERTIFICATE,
    },
    {
        key: 'certificate_of_residency',
        label: 'Certificate of Residency',
        tag: RegistrationDocumentTag.CERTIFICATE_OF_RESIDENCY,
    },
    {
        key: 'government_issued_id',
        label: 'Government Issued ID',
        tag: RegistrationDocumentTag.GOVERNMENT_ISSUED_ID,
    },
    {
        key: 'membership_certificate',
        label: 'Membership Certificate',
        tag: RegistrationDocumentTag.MEMBERSHIP_CERTIFICATE,
    },
]

const RegisterFormComponents = ({
    setShowRegistrationModal,
}: {
    setShowRegistrationModal: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const [fileData, setFileData] = useState<FileData>({
        birth_certificate: null,
        certificate_of_residency: null,
        government_issued_id: null,
        membership_certificate: null,
    })
    const [isUploadError, setIsUploadError] = useState<boolean>(false)

    const form = useForm<SeniorsFormData>({
        resolver: zodResolver(seniorsFormSchema),
        defaultValues: {
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            age: '',
            birthDate: '',
            gender: '',
            barangay: '',
            purok: '',
            contactNumber: '',
            emergencyNumber: '',
            pwd: false,
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tag: string) => {
        const file = e.target.files?.[0] || null

        if (file && !file.type.startsWith('image/')) {
            setIsUploadError(true)
            return
        }

        setFileData((prevData) => ({
            ...prevData,
            [tag as keyof FileData]: file,
        }))
    }

    const handleNumberInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: keyof SeniorsFormData
    ) => {
        const { value } = e.target
        const cleanedValue = value.replace(/\D/g, '')
        form.setValue(fieldName, cleanedValue.slice(0, 11))
    }

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            return await apiService.post('/api/seniors', formData)
        },
        onSuccess: (data) => {
            console.log('Success:', data)
            form.reset()
            setShowRegistrationModal(false)
            toast.success('Senior registered successfully!')
        },
        onError: (error) => {
            console.error('Error submitting form:', error)
            toast.error('Error in registering senior, please try again')
        },
    })

    const onSubmit = async (data: SeniorsFormData) => {
        const apiFormData = new FormData()

        Object.entries(data).forEach(([key, value]) => {
            apiFormData.append(key, typeof value === 'boolean' ? String(value) : value)
        })

        Object.entries(fileData).forEach(([key, file]) => {
            if (file) {
                apiFormData.append(key, file)
            }
        })

        mutation.mutate(apiFormData)
    }

    const getUploadedFileCount = () => {
        return Object.values(fileData).filter((file) => file !== null).length
    }

    return (
        <>
            <div className="max-h-[80vh] overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-1">
                        {/* Personal Information Section */}
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

                                {/* Email and Age Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> */}
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
                                                        max={100}
                                                        placeholder="Enter age"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                {/* Birth Date and Gender Row */}
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
                                                            field.onChange(
                                                                date
                                                                    ? format(date, 'MM/dd/yyyy')
                                                                    : ''
                                                            )
                                                        }}
                                                        dateFormat={[
                                                            'MM/dd/yyyy',
                                                            'yyyy-MM-dd',
                                                            'MMMM d, yyyy',
                                                            'MMM d, yyyy',
                                                            'MMMM dd, yyyy',
                                                            'MMMM dd yyyy',
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
                                    {/* PWD */}
                                    <FormField
                                        control={form.control}
                                        name="pwd"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col justify-end">
                                                <div className="flex items-center space-x-2 pb-2">
                                                    <Checkbox
                                                        id="pwd"
                                                        checked={field.value}
                                                        onCheckedChange={(checked) =>
                                                            field.onChange(!!checked)
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="pwd"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        Are you a PWD?
                                                    </label>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact & Address Section */}
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
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="tel"
                                                        maxLength={11}
                                                        placeholder="09123456789"
                                                        {...field}
                                                        onChange={(e) =>
                                                            handleNumberInputChange(
                                                                e,
                                                                'contactNumber'
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="emergencyNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Emergency Contact</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="tel"
                                                        maxLength={11}
                                                        placeholder="09123456789"
                                                        {...field}
                                                        onChange={(e) =>
                                                            handleNumberInputChange(
                                                                e,
                                                                'emergencyNumber'
                                                            )
                                                        }
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
                                                        type="address"
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

                        {/* Documents Section */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-green-600" />
                                        <CardTitle className="text-lg">
                                            Registration Documents
                                        </CardTitle>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                        {getUploadedFileCount()}/4 uploaded
                                    </Badge>
                                </div>
                                <CardDescription>
                                    Upload required documents for registration. Only image files are
                                    accepted (JPG, PNG, GIF, WEBP, etc.)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {DOCUMENT_TYPES.map((doc, index) => (
                                    <div key={doc.key} className="space-y-2">
                                        <Label htmlFor={doc.key} className="text-sm font-medium">
                                            {doc.label}
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    id={doc.key}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, doc.tag)}
                                                    className="file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-green-600 file:text-white hover:file:bg-green-700"
                                                />
                                            </div>
                                            {fileData[doc.key as keyof FileData] && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-green-600 border-green-200"
                                                >
                                                    <Upload className="h-3 w-3 mr-1" />
                                                    Uploaded
                                                </Badge>
                                            )}
                                        </div>
                                        {index < DOCUMENT_TYPES.length - 1 && (
                                            <Separator className="mt-4" />
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowRegistrationModal(false)}
                                disabled={mutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Registration'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            {isUploadError && (
                <AlertDialogComponent
                    dialogTitle="Failed to Upload File"
                    dialogMessage="Only Image Type is Allowed"
                />
            )}
        </>
    )
}

export default RegisterFormComponents

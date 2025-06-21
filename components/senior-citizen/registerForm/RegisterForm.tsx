'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form' // Import FormProvider
import { AlertDialogComponent } from '../../alert-component'
import { SeniorsFormData, seniorsFormSchema } from '@/schema/seniors/seniors.schema'
import { apiService } from '@/lib/axios'
import { useMutation } from '@tanstack/react-query'
import { cn } from '@/lib/utils' // Keep if still used elsewhere, though not in the snippet now
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Import the new nested components
import { PersonalInformation } from './components/PersonalInformation'
import { ContactAddress } from './components/ContactAddress'
import { RegistrationDocuments } from './components/RegistrationDocuments'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import {
    Form, // Only import Form from shadcn, not FormProvider
} from '@/components/ui/form'

type FileData = {
    birth_certificate: File | null
    certificate_of_residency: File | null
    government_issued_id: File | null
    membership_certificate: File | null
}

const DOCUMENT_KEYS = [
    'birth_certificate',
    'certificate_of_residency',
    'government_issued_id',
    'membership_certificate',
] as const; // Added 'as const' for better type inference

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
            email: '', // If you decide to add email back, keep this.
            age: '',
            birthDate: '',
            gender: '',
            barangay: '',
            purok: '',
            contactNumber: '',
            emergencyNumber: '',
            contactPerson: '',
            pwd: false,
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tag: string) => {
        const file = e.target.files?.[0] || null

        if (file && !file.type.startsWith('image/')) {
            setIsUploadError(true)
            // Optionally, clear the file input or reset the specific file in state
            // to prevent invalid files from being "stuck"
            setFileData((prevData) => ({
                ...prevData,
                [tag as keyof FileData]: null,
            }));
            return
        }

        setFileData((prevData) => ({
            ...prevData,
            [tag as keyof FileData]: file,
        }))
        setIsUploadError(false); // Clear error if a valid file is selected after an error
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
            setFileData({
                birth_certificate: null,
                certificate_of_residency: null,
                government_issued_id: null,
                membership_certificate: null,
            }); // Reset file data on success
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

        // Basic validation for documents before submission
        const allDocumentsUploaded = DOCUMENT_KEYS.every(key => fileData[key] !== null);
        if (!allDocumentsUploaded) {
            toast.error('Please upload all required registration documents.');
            return;
        }

        mutation.mutate(apiFormData)
    }

    const getUploadedFileCount = () => {
        return Object.values(fileData).filter((file) => file !== null).length
    }

    return (
        <>
            <div className="max-h-[80vh] overflow-y-auto">
                {/* FormProvider allows child components to access the form context */}
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-1">
                        {/* Personal Information Section */}
                        <PersonalInformation />

                        {/* Contact & Address Section */}
                        <ContactAddress handleNumberInputChange={handleNumberInputChange} />

                        {/* Documents Section */}
                        <RegistrationDocuments
                            fileData={fileData}
                            handleFileChange={handleFileChange}
                            getUploadedFileCount={getUploadedFileCount}
                            isUploadError={isUploadError}
                        />

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
                </FormProvider>
            </div>

            {isUploadError && (
                <AlertDialogComponent
                    dialogTitle="Failed to Upload File"
                    dialogMessage="Only Image Type is Allowed"
                    // Add a way to close the dialog, e.g., onOpenChange prop or a state setter
                    // For now, it will just show if isUploadError is true
                />
            )}
        </>
    )
}

export default RegisterFormComponents
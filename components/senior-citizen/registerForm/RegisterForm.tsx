'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { AlertDialogComponent } from '../../alert-component'
import { SeniorsFormData, seniorsFormSchema } from '@/schema/seniors/seniors.schema'
import { apiService } from '@/lib/axios'
import { useMutation, useQueryClient } from '@tanstack/react-query' // Import useQueryClient
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Import the new nested components
import { PersonalInformation } from './components/PersonalInformation'
import { ContactAddress } from './components/ContactAddress'
import { RegistrationDocuments } from './components/RegistrationDocuments'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import {
    Form,
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
] as const;

interface RegisterFormComponentsProps { // Define props interface
    setShowRegistrationModal: React.Dispatch<React.SetStateAction<boolean>>;
    onRecordAdded: () => void; // Add this new prop
}

const RegisterFormComponents = ({
    setShowRegistrationModal,
    onRecordAdded, // Destructure the new prop
}: RegisterFormComponentsProps) => { // Use the defined props interface
    const queryClient = useQueryClient(); // Initialize useQueryClient

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
            contactPerson: '',
            pwd: false,
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tag: string) => {
        const file = e.target.files?.[0] || null

        if (file && !file.type.startsWith('image/')) {
            setIsUploadError(true)
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
        setIsUploadError(false);
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
            });
            setShowRegistrationModal(false)
            toast.success('Senior registered successfully!')
            queryClient.invalidateQueries({ queryKey: ['seniors'] }); // Invalidate the 'seniors' query
            onRecordAdded(); // Call the callback from parent to potentially trigger more actions
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
            <div className="max-h-[80vh]">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-1">
                        <PersonalInformation />
                        <ContactAddress handleNumberInputChange={handleNumberInputChange} />
                        <RegistrationDocuments
                            fileData={fileData}
                            handleFileChange={handleFileChange}
                            getUploadedFileCount={getUploadedFileCount}
                            isUploadError={isUploadError}
                        />

                        <div className="flex justify-end gap-4 pt-4 pb-4">
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
                />
            )}
        </>
    )
}

export default RegisterFormComponents
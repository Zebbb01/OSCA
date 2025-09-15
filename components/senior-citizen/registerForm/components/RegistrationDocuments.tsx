import React from 'react'
import { FileText, Upload } from 'lucide-react'
import { RegistrationDocumentTag } from '@/types/seniors'

// shadcn/ui components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

type FileData = {
    birth_certificate: File | null
    certificate_of_residency: File | null
    government_issued_id: File | null
    membership_certificate: File | null
    low_income: File | null
}

type RegistrationDocumentsProps = {
    fileData: FileData;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, tag: string) => void;
    getUploadedFileCount: () => number;
    isUploadError: boolean;
}

// Document upload configuration
const DOCUMENT_TYPES = [
    {
        key: 'birth_certificate',
        label: 'Birth Certificate',
        tag: RegistrationDocumentTag.BIRTH_CERTIFICATE,
        required: true,
    },
    {
        key: 'certificate_of_residency',
        label: 'Certificate of Residency',
        tag: RegistrationDocumentTag.CERTIFICATE_OF_RESIDENCY,
        required: true,
    },
    {
        key: 'government_issued_id',
        label: 'Government Issued ID',
        tag: RegistrationDocumentTag.GOVERNMENT_ISSUED_ID,
        required: true,
    },
    {
        key: 'membership_certificate',
        label: 'Membership Certificate',
        tag: RegistrationDocumentTag.MEMBERSHIP_CERTIFICATE,
        required: true,
    },
    {
        key: 'low_income',
        label: 'Low Income',
        tag: RegistrationDocumentTag.LOW_INCOME,
        required: false, // Mark as optional
    },
]

export const RegistrationDocuments = ({
    fileData,
    handleFileChange,
    getUploadedFileCount,
    isUploadError,
}: RegistrationDocumentsProps) => {
    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg">
                            Registration Documents
                        </CardTitle>
                    </div>
                    {/* The badge should reflect the count of REQUIRED documents */}
                    <Badge variant="secondary" className="text-xs">
                        {getUploadedFileCount()}/4 uploaded
                    </Badge>
                </div>
                <CardDescription>
                    Upload required documents for registration. Only image files are
                    accepted (JPG, PNG, GIF, WEBP, etc.).
                    The low income document is optional.
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
    )
}
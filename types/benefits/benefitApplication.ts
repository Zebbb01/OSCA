// types/benefits/benefitApplication.ts
import { BenefitRequirement } from '@/types/benefits'
import { Seniors } from '@/types/seniors'

// Modal Props
export interface BenefitApplicationModalProps {
    isOpen: boolean
    onClose: () => void
    selectedBenefit: {
        id: number
        name: string
    }
}

// Component Props
export interface SearchInputProps {
    onSearch: (value: string) => void
}

export interface SeniorsListProps {
    seniors: Seniors[]
    selectedSeniorIds: number[]
    benefitRequirements: BenefitRequirement[]
    uploadedFiles: Record<string, File>
    onToggleSelection: (seniorId: number, isSelected: boolean) => void
    onFileUpload: (seniorId: number, requirementId: number, file: File) => void
    onRemoveFile: (seniorId: number, requirementId: number) => void
}

export interface SeniorCardProps {
    senior: Seniors
    isSelected: boolean
    benefitRequirements: BenefitRequirement[]
    uploadedFiles: Record<string, File>
    onToggleSelection: (seniorId: number, isSelected: boolean) => void
    onFileUpload: (seniorId: number, requirementId: number, file: File) => void
    onRemoveFile: (seniorId: number, requirementId: number) => void
}

export interface DocumentUploadSectionProps {
    seniorId: number
    requirements: BenefitRequirement[]
    uploadedFiles: Record<string, File>
    onUpload: (seniorId: number, requirementId: number, file: File) => void
    onRemove: (seniorId: number, requirementId: number) => void
}

export interface UploadedFileDisplayProps {
    file: File
    onRemove: () => void
}

export interface FileUploadButtonProps {
    onUpload: (file: File) => void
}

export interface SelectionSummaryProps {
    selectedCount: number
    hasRequirements: boolean
    allFulfilled: boolean
}

// State Components Props
export interface LoadingStateProps {
    message?: string
}

export interface ErrorStateProps {
    message: string
    subMessage?: string
}

export interface EmptyStateProps {
    message: string
    subMessage?: string
}
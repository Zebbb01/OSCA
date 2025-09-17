// components/benefits/BenefitApplicationModal.tsx
'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import PrimaryButton from '@/components/ui/primary-button'
import { cn } from '@/lib/utils'
import { useBenefitApplication } from '@/hooks/benefits/useBenefitApplication'
import { BenefitApplicationModalProps } from '@/types/benefits/benefitApplication'
import { SearchInput } from './modal/SearchInput'
import { SeniorsList } from './modal/SeniorsList'
import { LoadingState, EmptyState } from './modal/StateComponents'

const BenefitApplicationModal = ({ isOpen, onClose, selectedBenefit }: BenefitApplicationModalProps) => {
    const {
        selectedSeniorIds,
        benefitRequirements,
        uploadedFiles,
        seniorQuery,
        mutation,
        setSearchedName,
        handleFileUpload,
        removeFile,
        toggleSeniorSelection,
        allRequirementsFulfilled,
        handleSubmit,
        resetState,
    } = useBenefitApplication(selectedBenefit.id, onClose)

    const handleClose = () => {
        resetState()
        onClose()
    }

    const onSubmit = () => {
        handleSubmit(selectedBenefit.id, selectedBenefit.name)
    }

    const canSubmit = selectedSeniorIds.length > 0 && 
                     (benefitRequirements.length === 0 || allRequirementsFulfilled())

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                className="max-w-4xl max-h-[90vh] flex flex-col"
            >
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-xl">
                        Apply for {selectedBenefit.name}
                    </DialogTitle>
                    <DialogDescription>
                        Select senior citizens and upload required documents for this benefit program.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <SearchInput onSearch={setSearchedName} />
                    
                    <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                        {seniorQuery.isLoading && <LoadingState message="Loading seniors..." />}
                        {seniorQuery.data?.length === 0 && <EmptyState message="No seniors found" subMessage="Try adjusting your search terms" />}
                        {seniorQuery.data && seniorQuery.data.length > 0 && (
                            <SeniorsList
                                seniors={seniorQuery.data}
                                selectedSeniorIds={selectedSeniorIds}
                                benefitRequirements={benefitRequirements}
                                uploadedFiles={uploadedFiles}
                                onToggleSelection={toggleSeniorSelection}
                                onFileUpload={handleFileUpload}
                                onRemoveFile={removeFile}
                            />
                        )}
                    </div>
                </div>

                <DialogFooter className="flex-shrink-0 mt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={mutation.isPending}
                        className={cn(
                            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                            mutation.isPending
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                    >
                        Cancel
                    </button>

                    <PrimaryButton
                        disabled={mutation.isPending || !canSubmit}
                        onClick={onSubmit}
                        className={cn(
                            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                            mutation.isPending || !canSubmit
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        )}
                    >
                        {mutation.isPending ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                Submitting...
                            </span>
                        ) : (
                            `Apply for ${selectedSeniorIds.length} Senior${selectedSeniorIds.length !== 1 ? 's' : ''}`
                        )}
                    </PrimaryButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default BenefitApplicationModal
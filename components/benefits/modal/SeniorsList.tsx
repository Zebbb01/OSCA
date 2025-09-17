// components/benefits/modal/SeniorsList.tsx
import { SeniorsListProps } from '@/types/benefits/benefitApplication'
import { SeniorCard } from './SeniorCard'
import { SelectionSummary } from './SelectionSummary'

export const SeniorsList = ({ 
    seniors, 
    selectedSeniorIds, 
    benefitRequirements, 
    uploadedFiles, 
    onToggleSelection, 
    onFileUpload, 
    onRemoveFile 
}: SeniorsListProps) => (
    <div className="p-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {seniors.map((senior) => (
                <SeniorCard
                    key={senior.id}
                    senior={senior}
                    isSelected={selectedSeniorIds.includes(senior.id)}
                    benefitRequirements={benefitRequirements}
                    uploadedFiles={uploadedFiles}
                    onToggleSelection={onToggleSelection}
                    onFileUpload={onFileUpload}
                    onRemoveFile={onRemoveFile}
                />
            ))}
        </div>
        
        {selectedSeniorIds.length > 0 && (
            <SelectionSummary 
                selectedCount={selectedSeniorIds.length}
                hasRequirements={benefitRequirements.length > 0}
                allFulfilled={
                    benefitRequirements.length === 0 || 
                    selectedSeniorIds.every(id => 
                        benefitRequirements.every(req => uploadedFiles[`${id}_${req.id}`])
                    )
                }
            />
        )}
    </div>
)

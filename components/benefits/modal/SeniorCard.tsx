// components/benefits/modal/SeniorCard.tsx
import { SeniorCardProps } from '@/types/benefits/benefitApplication'
import { cn } from '@/lib/utils'
import { DocumentUploadSection } from './DocumentUploadSection'

export const SeniorCard = ({ 
    senior, 
    isSelected, 
    benefitRequirements, 
    uploadedFiles, 
    onToggleSelection, 
    onFileUpload, 
    onRemoveFile 
}: SeniorCardProps) => (
    <div className={cn(
        "rounded-lg border-2 p-4 transition-all duration-200",
        isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
    )}>
        <label className="flex items-start space-x-3 cursor-pointer">
            <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-green-600 rounded focus:ring-green-500 border-gray-300 mt-1"
                checked={isSelected}
                onChange={(e) => onToggleSelection(senior.id, e.target.checked)}
            />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-gray-800 font-medium">
                        {senior.firstname} {senior.middlename} {senior.lastname}
                    </span>
                    {senior.pwd && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                            PWD
                        </span>
                    )}
                </div>

                {isSelected && benefitRequirements.length > 0 && (
                    <DocumentUploadSection
                        seniorId={senior.id}
                        requirements={benefitRequirements}
                        uploadedFiles={uploadedFiles}
                        onUpload={onFileUpload}
                        onRemove={onRemoveFile}
                    />
                )}
            </div>
        </label>
    </div>
)
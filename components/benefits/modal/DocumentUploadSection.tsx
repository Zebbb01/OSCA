// components/benefits/modal/DocumentUploadSection.tsx
import { DocumentUploadSectionProps } from '@/types/benefits/benefitApplication'
import { faFileAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UploadedFileDisplay } from './UploadedFileDisplay'
import { FileUploadButton } from './FileUploadButton'

export const DocumentUploadSection = ({ 
    seniorId, 
    requirements, 
    uploadedFiles, 
    onUpload, 
    onRemove 
}: DocumentUploadSectionProps) => (
    <div className="mt-4 space-y-2 pl-2">
        <p className="text-sm font-semibold text-gray-700 mb-2">
            Upload Required Documents:
        </p>
        {requirements.map((requirement) => {
            const fileKey = `${seniorId}_${requirement.id}`
            const uploadedFile = uploadedFiles[fileKey]
            
            return (
                <div 
                    key={requirement.id} 
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                >
                    <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-gray-400" />
                    <span className="text-sm flex-1 text-gray-700">{requirement.name}</span>
                    
                    {uploadedFile ? (
                        <UploadedFileDisplay 
                            file={uploadedFile} 
                            onRemove={() => onRemove(seniorId, requirement.id)} 
                        />
                    ) : (
                        <FileUploadButton 
                            onUpload={(file) => onUpload(seniorId, requirement.id, file)} 
                        />
                    )}
                </div>
            )
        })}
    </div>
)
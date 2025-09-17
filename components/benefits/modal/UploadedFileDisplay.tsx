// components/benefits/modal/UploadedFileDisplay.tsx
import { UploadedFileDisplayProps } from '@/types/benefits/benefitApplication'
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const UploadedFileDisplay = ({ file, onRemove }: UploadedFileDisplayProps) => (
    <div className="flex items-center gap-2">
        <span className="text-xs text-green-600 flex items-center gap-1 max-w-[150px] truncate">
            <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
            {file.name}
        </span>
        <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition-colors"
        >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
        </button>
    </div>
)
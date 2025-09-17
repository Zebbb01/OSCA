// components/benefits/modal/FileUploadButton.tsx
import { FileUploadButtonProps } from '@/types/benefits/benefitApplication'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const FileUploadButton = ({ onUpload }: FileUploadButtonProps) => (
    <label className="flex items-center gap-2 cursor-pointer">
        <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onUpload(file)
            }}
        />
        <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 flex items-center gap-1 transition-colors">
            <FontAwesomeIcon icon={faUpload} className="w-3 h-3" />
            Upload
        </span>
    </label>
)
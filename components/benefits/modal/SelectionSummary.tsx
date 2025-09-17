// components/benefits/modal/SelectionSummary.tsx
import { SelectionSummaryProps } from '@/types/benefits/benefitApplication'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const SelectionSummary = ({ selectedCount, hasRequirements, allFulfilled }: SelectionSummaryProps) => (
    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-800 text-sm font-medium">
            {selectedCount} senior{selectedCount !== 1 ? 's' : ''} selected
        </p>
        {hasRequirements && !allFulfilled && (
            <p className="text-yellow-600 text-xs mt-1 flex items-center gap-1">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-3 h-3" />
                Please upload all required documents for each selected senior
            </p>
        )}
    </div>
)
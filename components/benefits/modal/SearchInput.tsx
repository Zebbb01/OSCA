// components/benefits/modal/SearchInput.tsx
import { SearchInputProps } from '@/types/benefits/benefitApplication'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const SearchInput = ({ onSearch }: SearchInputProps) => (
    <div className="relative mb-4 flex-shrink-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-gray-400" />
        </div>
        <input
            type="search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            placeholder="Search by first name, last name..."
            onChange={(e) => onSearch(e.target.value)}
        />
    </div>
)


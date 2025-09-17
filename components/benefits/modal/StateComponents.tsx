// components/benefits/modal/StateComponents.tsx
import { LoadingStateProps, EmptyStateProps, ErrorStateProps } from '@/types/benefits/benefitApplication'

export const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => (
    <div className="flex justify-center items-center py-12">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">{message}</p>
        </div>
    </div>
)

export const EmptyState = ({ message, subMessage }: EmptyStateProps) => (
    <div className="flex justify-center items-center py-12">
        <div className="text-center">
            <p className="text-gray-500">{message}</p>
            {subMessage && <p className="text-gray-400 text-sm mt-1">{subMessage}</p>}
        </div>
    </div>
)

export const ErrorState = ({ message, subMessage = "Please try again later" }: ErrorStateProps) => (
    <div className="flex justify-center items-center py-12">
        <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-500 text-lg font-medium">{message}</p>
            {subMessage && <p className="text-gray-500 mt-2">{subMessage}</p>}
        </div>
    </div>
)
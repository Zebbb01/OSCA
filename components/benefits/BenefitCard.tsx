// components/benefits/BenefitCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import PrimaryButton from '@/components/ui/primary-button'
import { Benefit } from '@/types/benefits'

interface BenefitCardProps {
    benefit: Benefit
    onApply: (benefitId: number, benefitName: string) => void
}

const BenefitCard = ({ benefit, onApply }: BenefitCardProps) => {
    return (
        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
                <div className="flex flex-col h-full">
                    <div className="flex-1 mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                            {benefit.name}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                            {benefit.description}
                        </p>
                        {benefit.benefit_requirements?.length > 0 && (
                            <RequirementsBadges requirements={benefit.benefit_requirements} />
                        )}
                    </div>
                    <PrimaryButton
                        onClick={() => onApply(benefit.id, benefit.name)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                    >
                        Apply Now
                    </PrimaryButton>
                </div>
            </CardContent>
        </Card>
    )
}

const RequirementsBadges = ({ requirements }: { requirements: any[] }) => {
    const visibleRequirements = requirements.slice(0, 3)
    const remainingCount = requirements.length - 3

    return (
        <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1 font-medium">Requirements:</p>
            <div className="flex flex-wrap gap-1">
                {visibleRequirements.map((req) => (
                    <span key={req.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {req.name}
                    </span>
                ))}
                {remainingCount > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        +{remainingCount} more
                    </span>
                )}
            </div>
        </div>
    )
}

export default BenefitCard
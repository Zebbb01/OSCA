// app/admin/applications/benefits/page.tsx
'use client'

import AddBenefitForm from '@/components/benefits/AddBenefitForm'
import BenefitCard from '@/components/benefits/BenefitCard'
import BenefitApplicationModal from '@/components/benefits/BenefitApplicationModal'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { apiService } from '@/lib/axios'
import { Benefit } from '@/types/benefits'
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

const BenefitsPage = () => {
    const [isAddBenefitModalOpen, setIsAddBenefitModalOpen] = useState(false)
    const [selectedBenefit, setSelectedBenefit] = useState({ id: -1, name: '' })
    const [isBenefitApplicationModalOpen, setIsBenefitApplicationModalOpen] = useState(false)

    // Fetch benefits
    const benefitsQuery = useQuery({
        queryKey: ['benefits'],
        queryFn: async () => {
            return await apiService.get<Benefit[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits`)
        },
    })

    const handleApplyBenefit = (benefitId: number, benefitName: string) => {
        setSelectedBenefit({ id: benefitId, name: benefitName })
        setIsBenefitApplicationModalOpen(true)
    }

    const renderBenefitsContent = () => {
        if (benefitsQuery.isLoading) {
            return <LoadingState message="Loading benefits..." />
        }

        if (benefitsQuery.isError) {
            return <ErrorState message="Failed to fetch benefits" />
        }

        if (!benefitsQuery.data?.length) {
            return <EmptyState message="No benefits found" />
        }

        return benefitsQuery.data.map((benefit) => (
            <BenefitCard 
                key={benefit.id} 
                benefit={benefit} 
                onApply={handleApplyBenefit}
            />
        ))
    }

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Benefits Management</h1>
                    <p className="text-gray-600 mt-1">Track and manage benefits for senior citizens</p>
                </div>

                {/* Add Benefit Dialog */}
                <Dialog open={isAddBenefitModalOpen} onOpenChange={setIsAddBenefitModalOpen}>
                    <DialogTrigger className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium shadow-md hover:shadow-lg">
                        <FontAwesomeIcon icon={faCirclePlus} className="w-4 h-4" />
                        Add New Benefit
                    </DialogTrigger>
                    <DialogContent 
                        onEscapeKeyDown={(e) => e.preventDefault()}
                        onPointerDownOutside={(e) => e.preventDefault()}
                        className="max-w-2xl"
                    >
                        <DialogHeader>
                            <DialogTitle>Add New Benefit</DialogTitle>
                            <DialogDescription>Fill out the form below to create a new benefit program.</DialogDescription>
                        </DialogHeader>
                        <AddBenefitForm setIsAddBenefitModalOpen={setIsAddBenefitModalOpen} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {renderBenefitsContent()}
            </div>

            {/* Application Modal */}
            <BenefitApplicationModal
                isOpen={isBenefitApplicationModalOpen}
                onClose={() => {
                    setIsBenefitApplicationModalOpen(false)
                    setSelectedBenefit({ id: -1, name: '' })
                }}
                selectedBenefit={selectedBenefit}
            />
        </div>
    )
}

// Reusable state components
const LoadingState = ({ message }: { message: string }) => (
    <div className="col-span-full flex justify-center items-center py-20">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">{message}</p>
        </div>
    </div>
)

const ErrorState = ({ message }: { message: string }) => (
    <div className="col-span-full flex justify-center items-center py-20">
        <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-500 text-lg font-medium">{message}</p>
            <p className="text-gray-500 mt-2">Please try again later</p>
        </div>
    </div>
)

const EmptyState = ({ message }: { message: string }) => (
    <div className="col-span-full flex justify-center items-center py-20">
        <div className="text-center">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <p className="text-gray-500 text-lg font-medium">{message}</p>
            <p className="text-gray-400 mt-2">Click "Add New Benefit" to get started</p>
        </div>
    </div>
)

export default BenefitsPage
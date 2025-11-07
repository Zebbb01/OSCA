// app\admin\applications\benefits\page.tsx
'use client'

import AddBenefitForm from '@/components/benefits/AddBenefitForm'
import { Card, CardContent } from '@/components/ui/card'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import PrimaryButton from '@/components/ui/primary-button'
import { BenefitApplicationFormData } from '@/schema/benefit/benefit.schema'
import { apiService } from '@/lib/axios'
import { cn } from '@/lib/utils'
import { POSTApiResponse } from '@/types/api'
import { Benefit } from '@/types/benefits'
import { Seniors } from '@/types/seniors'
import { faCirclePlus, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

const BenefitsPage = () => {
    // BENEFIT DATA QUERY
    const benefitsQuery = useQuery({
        queryKey: ['benefits'],
        queryFn: async () => {
            const respData = await apiService.get<Benefit[]>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits`)
            console.log('respData benefits: ', respData)
            return respData
        },
    })

    // STATE HANDLING DIALOG OPEN / CLOSE
    const [isAddBenefitModalOpen, setIsAddBenefitModalOpen] = useState<boolean>(false)
    const [isBenefitApplicationModalOpen, setIsBenefitApplicationModalOpen] =
        useState<boolean>(false)

    // CHECKED SENIOR ID'S TO APPLY FOR BENEFITS
    const [selectedSeniorIds, setSelectedSeniorIds] = useState<number[]>([])

    // SEARCH NAME STATE
    const [searchedName, setSearchedName] = useState<string>()

    // FETCHING SENIORS BASED OF SEARCHED NAME. IF EMPTY SEARCH IT RETURNS ALL SENIORS
    const fetchSeniors = async (name?: string | undefined) => {
        const url = name ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors?name=${encodeURIComponent(name)}` : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`

        const respData = await apiService.get<Seniors[]>(url)
        console.log('respData seniors benefits: ', respData)
        return respData
    }

    // SENIOR DATA QUERY
    const seniorQuery = useQuery({
        queryKey: ['seniors-list', searchedName],
        queryFn: () => fetchSeniors(searchedName),
    })

    // INPUT SEARCH ONCHANGE
    const onSearch = (name: string) => {
        console.log('Searched Name:', name)
        setSearchedName(name)
    }

    // MUTATION FOR SUBMITTING BENEFIT APPLICATION
    const mutation = useMutation({
        mutationFn: async (data: BenefitApplicationFormData) => {
            return await apiService.post<POSTApiResponse>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application`, data)
        },
        onSuccess: (resp) => {
            console.log('Success:', resp)
            toast.success(resp.msg)

            setTimeout(() => {
                setIsBenefitApplicationModalOpen(false)
            }, 1000)
        },

        onError: (error) => {
            toast.error('Error in Benefit Application, please try again!')
            console.error('Error submitting form:', error)
        },
    })

    const [selectedBenefit, setSelectedBenefit] = useState({
        id: -1,
        name: '',
    })

    const onShowBenefitApplicationModal = (benefitID: number, benefitName: string) => {
        setIsBenefitApplicationModalOpen(true)
        setSelectedBenefit({
            id: benefitID,
            name: benefitName,
        })
    }

    // HANDLE APPLICATION SUBMISSION
    const onSubmitApplication = (benefit_id: number) => {
        console.log('selected benefit_id: ', benefit_id)
        console.log("selected ID's: ", selectedSeniorIds)

        const data: BenefitApplicationFormData = {
            benefit_id: benefit_id,
            selected_senior_ids: selectedSeniorIds,
            status: 'pending', // <--- ADD THIS LINE
        }

        mutation.mutate(data)
    }

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Benefits Management</h1>
                    <p className="text-gray-600 mt-1">
                        Track and manage benefits for senior citizens
                    </p>
                </div>
                
                {/* Add New Benefit Button */}
                <Dialog open={isAddBenefitModalOpen} onOpenChange={setIsAddBenefitModalOpen}>
                    <DialogTrigger
                        onClick={() => setIsAddBenefitModalOpen(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                    >
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
                            <DialogDescription>
                                Fill out the form below to create a new benefit program.
                            </DialogDescription>
                        </DialogHeader>

                        <AddBenefitForm setIsAddBenefitModalOpen={setIsAddBenefitModalOpen} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {benefitsQuery.isLoading ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading benefits...</p>
                        </div>
                    </div>
                ) : benefitsQuery.isError ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <p className="text-red-500 text-lg font-medium">
                                Failed to fetch benefits
                            </p>
                            <p className="text-gray-500 mt-2">Please try again later</p>
                        </div>
                    </div>
                ) : benefitsQuery.data && benefitsQuery.data.length === 0 ? (
                    <div className="col-span-full flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="text-gray-400 text-5xl mb-4">📋</div>
                            <p className="text-gray-500 text-lg font-medium">
                                No benefits found
                            </p>
                            <p className="text-gray-400 mt-2">
                                Click "Add New Benefit" to get started
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {benefitsQuery.data &&
                            benefitsQuery.data.map((benefit) => (
                                <Card key={benefit.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-1 mb-4">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                                                    {benefit.name}
                                                </h3>
                                                <p className="text-gray-600 text-sm line-clamp-3">
                                                    {benefit.description}
                                                </p>
                                            </div>

                                            <PrimaryButton
                                                onClick={() => onShowBenefitApplicationModal(benefit.id, benefit.name)}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition-colors duration-200 font-medium"
                                            >
                                                Apply Now
                                            </PrimaryButton>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </>
                )}
            </div>

            {/* Application Modal */}
            <Dialog
                open={isBenefitApplicationModalOpen}
                onOpenChange={setIsBenefitApplicationModalOpen}
            >
                <DialogContent
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                    className="max-w-3xl max-h-[90vh] flex flex-col"
                >
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-xl">
                            Apply for {selectedBenefit.name}
                        </DialogTitle>
                        <DialogDescription>
                            Select senior citizens to apply for this benefit program.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        {/* Search Input */}
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

                        {/* Seniors List */}
                        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                            {seniorQuery.isLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                                        <p className="text-gray-500 text-sm">Loading seniors...</p>
                                    </div>
                                </div>
                            ) : seniorQuery.data && seniorQuery.data.length === 0 ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="text-center">
                                        <p className="text-gray-500">No seniors found</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Try adjusting your search terms
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4">
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {seniorQuery.data &&
                                            seniorQuery.data.map((senior) => (
                                                <label
                                                    key={senior.id}
                                                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox h-4 w-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                                                        checked={selectedSeniorIds.includes(senior.id)}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked
                                                            setSelectedSeniorIds((prev) =>
                                                                checked
                                                                    ? [...prev, senior.id]
                                                                    : prev.filter((id) => id !== senior.id)
                                                            )
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <span className="text-gray-800 font-medium">
                                                            {senior.firstname} {senior.middlename} {senior.lastname}
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                    </div>
                                    
                                    {selectedSeniorIds.length > 0 && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-green-800 text-sm font-medium">
                                                {selectedSeniorIds.length} senior{selectedSeniorIds.length !== 1 ? 's' : ''} selected
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex-shrink-0 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsBenefitApplicationModalOpen(false)}
                            disabled={mutation.isPending}
                            className={cn(
                                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                                mutation.isPending
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            )}
                        >
                            Cancel
                        </button>

                        <PrimaryButton
                            disabled={mutation.isPending || selectedSeniorIds.length === 0}
                            className={cn(
                                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                                mutation.isPending || selectedSeniorIds.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            )}
                            onClick={() => {
                                if (selectedBenefit.id !== -1 && selectedSeniorIds.length > 0) {
                                    onSubmitApplication(selectedBenefit.id)
                                } else {
                                    toast.error('Please select at least one senior before submitting.')
                                }
                            }}
                        >
                            {mutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Submitting...
                                </span>
                            ) : (
                                `Apply for ${selectedSeniorIds.length} Senior${selectedSeniorIds.length !== 1 ? 's' : ''}`
                            )}
                        </PrimaryButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default BenefitsPage
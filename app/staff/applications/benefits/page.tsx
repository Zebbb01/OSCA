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
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

const BenefitsPage = () => {
    // BENEFIT DATA QUERY
    const benefitsQuery = useQuery({
        queryKey: ['benefits'],
        queryFn: async () => {
            const respData = await apiService.get<Benefit[]>('/api/benefits')
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
        const url = name ? `/api/seniors?name=${encodeURIComponent(name)}` : '/api/seniors'

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
            return await apiService.post<POSTApiResponse>('/api/benefits/application', data)
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
        }

        mutation.mutate(data)
    }

    return (
        <div className="container mx-auto border-1 border-gray-400 p-5 rounded-md mt-8">
            <div className="flex flex-col justify-center mb-6">
                <h1 className="text-2xl text-gray-600">Application Benefits</h1>
                <p className="text-gray-500 text-sm">
                    Track and manage the various benefits provided to senior citizens
                </p>
            </div>

            {/* DIALOG FOR ADDING NEW BENEFIT */}
            <div className="flex justify-end pr-3 mb-3">
                <Dialog open={isAddBenefitModalOpen} onOpenChange={setIsAddBenefitModalOpen}>
                    <DialogTrigger
                        onClick={() => setIsAddBenefitModalOpen(true)}
                        className="flex items-center justify-center gap-1 md:w-[25%] lg:w-[15%] bg-green-700 text-white rounded-md p-2 mt-5 text-center hover:opacity-75 hover:cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faCirclePlus} className="size-3" />
                        Add New
                    </DialogTrigger>

                    <DialogContent
                        onEscapeKeyDown={(e) => e.preventDefault()}
                        onPointerDownOutside={(e) => e.preventDefault()}
                        className="!max-w-2xl"
                    >
                        <DialogHeader>
                            <DialogTitle>Register New Senior</DialogTitle>
                            <DialogDescription>
                                Fill out the form below to register a senior citizen.
                            </DialogDescription>
                        </DialogHeader>

                        {/* ADD NEW BENEFIT FORM */}
                        <AddBenefitForm setIsAddBenefitModalOpen={setIsAddBenefitModalOpen} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-auto min-h-screen place-items-center md:place-items-start">
                {benefitsQuery.isLoading ? (
                    <p className="col-span-full text-gray-500 text-lg">Loading benefits...</p>
                ) : benefitsQuery.isError ? (
                    <p className="col-span-full text-red-500  text-lg">
                        Failed to fetch benefits. Please try again later.
                    </p>
                ) : benefitsQuery.data && benefitsQuery.data.length === 0 ? (
                    <p className="col-span-full text-gray-500  text-lg">
                        No benefit records found.
                    </p>
                ) : (
                    <>
                        {benefitsQuery.data &&
                            benefitsQuery.data.map((benefit) => (
                                <Card key={benefit.id} className="w-full md:w-[310px]">
                                    <CardContent>
                                        <div className="w-full flex flex-col gap-2">
                                            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                {benefit.name}
                                            </h5>
                                            <p className="font-normal text-gray-500 dark:text-gray-400">
                                                {benefit.description}
                                            </p>
                                        </div>

                                        <PrimaryButton
                                            onClick={() => onShowBenefitApplicationModal(benefit.id, benefit.name)}
                                            className="flex items-center justify-center block w-full bg-green-700 text-white rounded-md p-2 mt-5 text-center hover:opacity-75 hover:cursor-pointer"
                                        >
                                            Start Applying
                                        </PrimaryButton>
                                    </CardContent>
                                </Card>
                            ))}

                        <Dialog
                            open={isBenefitApplicationModalOpen}
                            onOpenChange={setIsBenefitApplicationModalOpen}
                        >
                            <DialogContent
                                onEscapeKeyDown={(e) => e.preventDefault()}
                                onPointerDownOutside={(e) => e.preventDefault()}
                                className="!max-w-2xl"
                            >
                                <DialogHeader>
                                    <DialogTitle>Apply For {selectedBenefit.name} </DialogTitle>
                                    <DialogDescription>
                                        Select Senior citizen's name that will apply for this
                                        benefit.
                                    </DialogDescription>

                                    <div className="relative">
                                        <div className="absolute top-8 left-3 pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="search"
                                            id="default-search"
                                            className="block w-full p-2 ps-10 mt-5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Search Senior's First Name, Last Name..."
                                            onChange={(e) => onSearch(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* LIST OF SENIORS AND CHECKBOXES */}
                                    {seniorQuery.isLoading ? (
                                        <p className="text-gray-700 text-md mt-5">
                                            Loading Seniors...
                                        </p>
                                    ) : seniorQuery.data && seniorQuery.data.length === 0 ? (
                                        <p className="text-gray-700 text-md mt-5">
                                            No seniors found.
                                        </p>
                                    ) : (
                                        <ul className="space-y-2 p-2 text-lg">
                                            {seniorQuery.data &&
                                                seniorQuery.data.map((senior) => (
                                                    <li
                                                        key={senior.id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id={`senior-${senior.id}`}
                                                            className="form-checkbox"
                                                            checked={selectedSeniorIds.includes(
                                                                senior.id
                                                            )}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked
                                                                setSelectedSeniorIds(
                                                                    (prev) =>
                                                                        checked
                                                                            ? [...prev, senior.id] // add if checked
                                                                            : prev.filter(
                                                                                  (id) =>
                                                                                      id !==
                                                                                      senior.id
                                                                              ) // remove if unchecked
                                                                )
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`senior-${senior.id}`}
                                                            className="text-gray-800"
                                                        >
                                                            {senior.firstname} {''}
                                                            {senior.middlename} {''}
                                                            {senior.lastname}
                                                        </label>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </DialogHeader>

                                <DialogFooter>
                                    <button
                                        type="button"
                                        onClick={() => setIsBenefitApplicationModalOpen(false)}
                                        disabled={mutation.isPending}
                                        className={cn(
                                            'rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600',
                                            mutation.isPending
                                                ? 'bg-gray-500'
                                                : 'bg-gray-900 hover:bg-gray-800 hover:cursor-pointer'
                                        )}
                                    >
                                        Cancel
                                    </button>

                                    <PrimaryButton
                                        disabled={mutation.isPending}
                                        className={cn(
                                            'rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600',
                                            mutation.isPending
                                                ? 'bg-gray-500'
                                                : 'bg-green-600 hover:bg-green-500'
                                        )}
                                        onClick={() => {
                                            if (selectedBenefit.id !== null) {
                                                onSubmitApplication(selectedBenefit.id)
                                            } else {
                                                toast.error(
                                                    'Please select a valid benefit before submitting.'
                                                )
                                            }
                                        }}
                                    >
                                        {mutation.isPending ? 'Submitting...' : 'Submit'}
                                    </PrimaryButton>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>
        </div>
    )
}

export default BenefitsPage

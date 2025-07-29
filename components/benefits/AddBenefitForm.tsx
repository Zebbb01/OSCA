import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BenefitFormData, benefitFormSchema } from '@/schema/benefit/benefit.schema'
import { apiService } from '@/lib/axios'
import { cn, toSnakeCase } from '@/lib/utils'
import { POSTApiResponse } from '@/types/api'
import { faCirclePlus, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import PrimaryButton from '../ui/primary-button'

const AddBenefitForm = ({
    setIsAddBenefitModalOpen,
}: {
    setIsAddBenefitModalOpen: Dispatch<SetStateAction<boolean>>
}) => {
    // INITIALIZE REACT QUERY CLIENT FOR BENEFITS INVALIDATION
    const queryClient = useQueryClient()

    // HOOK FORM INITIALIZED
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<BenefitFormData>({
        resolver: zodResolver(benefitFormSchema),
    })

    // INITIALIZED ARRAY FIELDS FOR ADDING DYNAMIC REQUIREMENTS
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'requirements', // This will be an array of objects with a "name" field
    })

    // ADD SENIOR MUTATION
    const mutation = useMutation({
        mutationFn: async (data: BenefitFormData) => {
            return await apiService.post<POSTApiResponse>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits`, data)
        },
        onSuccess: (resp) => {
            console.log('Success:', resp)
            toast.success(resp.msg)
            queryClient.invalidateQueries({ queryKey: ['benefits'] })

            setTimeout(() => {
                setIsAddBenefitModalOpen(false)
                reset()
            }, 1000)
        },

        onError: (error) => {
            console.error('Error submitting form:', error)
        },
    })

    // HANDLE FORM SUBMISSION
    const onSubmit = (data: BenefitFormData) => {
        console.log(data)
        mutation.mutate(data)
    }

    // WATCH EVERY CHANGES IN THE NAME FIELD AND MAKE THE TAG AUTOMATIC SNAKE CASE
    const nameValue = watch('name')

    useEffect(() => {
        if (nameValue) {
            const tagValue = toSnakeCase(nameValue)
            setValue('tag', tagValue)
        }
    }, [nameValue, setValue])

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full overflow-y-auto mt-5">
                {/* BENEFIT NAME FIELD */}
                <div className="mb-3">
                    <label htmlFor="name" className="block text-sm/6 text-gray-900">
                        Benefit Name
                    </label>
                    <div className="mt-2">
                        <input
                            {...register('name', {
                                required: 'Benefit Name is required',
                            })}
                            type="text"
                            id="name"
                            className="font-medium block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                        />
                        {errors.name && (
                            <span className="text-red-500 text-xs">{errors.name.message}</span>
                        )}
                    </div>
                </div>

                {/* DESCRIPTION FIELD */}
                <div className="mb-3">
                    <label htmlFor="description" className="block text-sm/6 text-gray-900">
                        Description
                    </label>
                    <div className="mt-2">
                        <input
                            {...register('description', {
                                required: 'Description is required',
                            })}
                            type="text"
                            id="description"
                            className="font-medium block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                        />
                        {errors.description && (
                            <span className="text-red-500 text-xs">
                                {errors.description.message}
                            </span>
                        )}
                    </div>
                </div>

                {/* TAG FIELD */}
                <div className="mb-3">
                    <div className="flex items-center gap-1">
                        <label htmlFor="tag" className="block text-sm/6 text-gray-900">
                            Tag
                        </label>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <FontAwesomeIcon icon={faInfoCircle} className="size-3" />
                                </TooltipTrigger>

                                <TooltipContent>
                                    <p>
                                        If the name is set to Monthly Allowance the tag value is
                                        monthly_allowance
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="mt-2">
                        <input
                            {...register('tag', {
                                required: 'Tag is required',
                            })}
                            type="text"
                            id="tag"
                            readOnly
                            className="font-medium block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                        />
                        {errors.tag && (
                            <span className="text-red-500 text-xs">{errors.tag.message}</span>
                        )}
                    </div>

                    {/* REQUIREMENTS FIELD (Repeater) */}
                    <div className="my-3 pl-1">
                        <label className="block text-sm/6 text-gray-900">
                            Benefit Requirements
                        </label>

                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2 my-2">
                                <input
                                    {...register(`requirements.${index}.name`, {
                                        required: 'Requirement is required',
                                    })}
                                    type="text"
                                    placeholder={`Requirement ${index + 1}`}
                                    className="flex-1 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-green-600 sm:text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-red-500 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <div className="flex flex-col">
                            {errors.requirements && (
                                <span className="text-red-500 text-xs">
                                    At least one requirement is required.
                                </span>
                            )}

                            <PrimaryButton
                                type="button"
                                disabled={mutation.isPending}
                                onClick={() => append({ name: '' })}
                                className={cn(
                                    'w-1/4 text-sm/6 mt-1 rounded-md p-2 ',
                                    mutation.isPending ? 'bg-gray-500' : ''
                                )}
                            >
                                <FontAwesomeIcon icon={faCirclePlus} className="size-3" /> Add Req.
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => setIsAddBenefitModalOpen(false)}
                            disabled={mutation.isPending}
                            className={cn(
                                'rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-green-600',
                                mutation.isPending
                                    ? 'bg-gray-500'
                                    : 'bg-gray-900 hover:bg-gray-800 hover:cursor-pointer'
                            )}
                        >
                            Cancel
                        </button>

                        <PrimaryButton
                            type="submit"
                            disabled={mutation.isPending}
                            className={cn(
                                'rounded-md  px-3 py-2 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-green-600',
                                mutation.isPending
                                    ? 'bg-gray-500'
                                    : ''
                            )}
                        >
                            {mutation.isPending ? 'Submitting...' : 'Submit'}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AddBenefitForm

// hooks/benefits/useBenefitApplication.ts
import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiService } from '@/lib/axios'
import { POSTApiResponse } from '@/types/api'
import { BenefitRequirement } from '@/types/benefits'
import { Seniors } from '@/types/seniors'
import { toast } from 'sonner'

export const useBenefitApplication = (
    selectedBenefitId: number,
    onSuccess?: () => void
) => {
    const [selectedSeniorIds, setSelectedSeniorIds] = useState<number[]>([])
    const [searchedName, setSearchedName] = useState<string>()
    const [benefitRequirements, setBenefitRequirements] = useState<BenefitRequirement[]>([])
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({})

    // Fetch seniors
    const seniorQuery = useQuery({
        queryKey: ['seniors-list', searchedName],
        queryFn: async () => {
            const url = searchedName 
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors?name=${encodeURIComponent(searchedName)}` 
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors`
            return await apiService.get<Seniors[]>(url)
        },
    })

    // Fetch benefit requirements
    useEffect(() => {
        if (selectedBenefitId > 0) {
            apiService.get<BenefitRequirement[]>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits?benefit_id=${selectedBenefitId}`
            ).then(setBenefitRequirements).catch(() => setBenefitRequirements([]))
        }
    }, [selectedBenefitId])

    // Submit mutation
    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            return await apiService.post<POSTApiResponse>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/benefits/application`, 
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
        },
        onSuccess: (resp) => {
            toast.success(resp.msg)
            resetState()
            if (onSuccess) {
                setTimeout(onSuccess, 1000)
            }
        },
        onError: () => {
            toast.error('Error in Benefit Application, please try again!')
        },
    })

    const resetState = () => {
        setSelectedSeniorIds([])
        setUploadedFiles({})
        setBenefitRequirements([])
        setSearchedName(undefined)
    }

    const handleFileUpload = (seniorId: number, requirementId: number, file: File) => {
        setUploadedFiles(prev => ({ ...prev, [`${seniorId}_${requirementId}`]: file }))
    }

    const removeFile = (seniorId: number, requirementId: number) => {
        setUploadedFiles(prev => {
            const newFiles = { ...prev }
            delete newFiles[`${seniorId}_${requirementId}`]
            return newFiles
        })
    }

    const toggleSeniorSelection = (seniorId: number, isSelected: boolean) => {
        if (isSelected) {
            setSelectedSeniorIds(prev => [...prev, seniorId])
        } else {
            setSelectedSeniorIds(prev => prev.filter(id => id !== seniorId))
            // Remove files for this senior
            Object.keys(uploadedFiles).forEach(key => {
                if (key.startsWith(`${seniorId}_`)) {
                    const requirementId = parseInt(key.split('_')[1])
                    removeFile(seniorId, requirementId)
                }
            })
        }
    }

    const allRequirementsFulfilled = () => {
        if (!selectedSeniorIds.length || !benefitRequirements.length) return false
        
        return selectedSeniorIds.every(seniorId =>
            benefitRequirements.every(req => uploadedFiles[`${seniorId}_${req.id}`])
        )
    }

    const handleSubmit = (benefitId: number, benefitName: string) => {
        if (benefitId === -1 || !selectedSeniorIds.length) {
            toast.error('Please select at least one senior before submitting.')
            return
        }

        if (benefitRequirements.length && !allRequirementsFulfilled()) {
            toast.error('Please upload all required documents before submitting.')
            return
        }

        const formData = new FormData()
        formData.append('benefit_id', benefitId.toString())
        formData.append('selected_senior_ids', JSON.stringify(selectedSeniorIds))

        Object.entries(uploadedFiles).forEach(([key, file]) => {
            const [seniorId, requirementId] = key.split('_')
            formData.append(`requirement_${seniorId}_${requirementId}`, file)
        })

        mutation.mutate(formData)
    }

    return {
        // State
        selectedSeniorIds,
        searchedName,
        benefitRequirements,
        uploadedFiles,
        
        // Query
        seniorQuery,
        
        // Mutation
        mutation,
        
        // Actions
        setSearchedName,
        handleFileUpload,
        removeFile,
        toggleSeniorSelection,
        allRequirementsFulfilled,
        handleSubmit,
        resetState,
    }
}
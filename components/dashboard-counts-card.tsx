// components/dashboard-counts-card.tsx
'use client'

import { useEffect, useState } from 'react'

interface SeniorCounts {
    totalSeniors: number
    totalPwdSeniors: number
    totalSeniorsAppliedForBenefits: number
    categoryCounts: {
        Special: number
        Regular: number
        LowIncome: number
    }
    newlyRegisteredSeniors: number
}

export const DashboardCountsCard = () => {
    const [seniorCounts, setSeniorCounts] = useState<SeniorCounts | null>(null)
    const [loadingCounts, setLoadingCounts] = useState(true)
    const [errorCounts, setErrorCounts] = useState<string | null>(null)

    useEffect(() => {
        const fetchSeniorCounts = async () => {
            try {
                setLoadingCounts(true)
                const response = await fetch('/api/dashboard/stats')
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const result = await response.json()
                
                if (!result.success) {
                    throw new Error(result.message || 'Failed to fetch counts')
                }
                
                setSeniorCounts(result.data)
            } catch (error: any) {
                console.error('Error fetching senior counts:', error)
                setErrorCounts(error.message)
            } finally {
                setLoadingCounts(false)
            }
        }

        fetchSeniorCounts()
    }, [])

    return (
        <div className="md:col-span-2 bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">Senior Citizen Overview</h2>
            
            {loadingCounts && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="ml-3 text-gray-600">Loading senior counts...</p>
                </div>
            )}
            
            {errorCounts && (
                <div className="text-center py-8">
                    <p className="text-red-500 mb-4">Error: {errorCounts}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}
            
            {seniorCounts && (
                <div className="flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="p-4 border rounded-lg text-center flex flex-col justify-center bg-blue-50">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Number of Regular<br/>Senior Citizens
                            </h3>
                            <p className="text-4xl font-bold text-blue-600">
                                {seniorCounts.categoryCounts.Regular}
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg text-center flex flex-col justify-center bg-purple-50">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Number of PWD<br/>Senior Citizens
                            </h3>
                            <p className="text-4xl font-bold text-purple-600">
                                {seniorCounts.totalPwdSeniors}
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg text-center flex flex-col justify-center bg-green-50">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Number of Newly<br/>Registered Seniors
                            </h3>
                            <p className="text-4xl font-bold text-green-600">
                                {seniorCounts.newlyRegisteredSeniors}
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg text-center flex flex-col justify-center bg-cyan-50">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Applied benefits
                            </h3>
                            <p className="text-4xl font-bold text-cyan-600">
                                {seniorCounts.totalSeniorsAppliedForBenefits}
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg text-center flex flex-col justify-center bg-orange-50 md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Overall Total</h3>
                            <p className="text-4xl font-bold text-orange-600">
                                {seniorCounts.totalSeniors}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
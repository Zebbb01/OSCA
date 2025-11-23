// app/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { BarChartComponent } from '@/components/bar-chart'
import { ChartConfig } from '@/components/ui/chart'
import { DashboardCountsCard } from '@/components/dashboard-counts-card'
import { RegistrationTrendsChart } from '@/components/registration-trends-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Users, UserCheck, FileText, Shield, Loader2 } from 'lucide-react'
import { useRouter } from "next/navigation"; // ADD THIS


interface CategoryData {
    name: string
    value: number
    color: string
}

interface BarangayData extends Record<string, unknown> {
    barangay: string
    seniors: number
    pwd: number
    regular: number
}

interface AgeDistributionData extends Record<string, unknown> {
    ageGroup: string
    male: number
    female: number
}

const chartConfig = {
    male: {
        label: 'Male',
        color: '#3b82f6',
    },
    female: {
        label: 'Female',
        color: '#ec4899',
    },
    pwd: {
        label: 'PWD',
        color: '#8b5cf6',
    },
    regular: {
        label: 'Regular',
        color: '#22c55e',
    }
} satisfies ChartConfig

const DashboardPage = () => {
    const [categoriesData, setCategoriesData] = useState<CategoryData[]>([])
    const [barangayData, setBarangayData] = useState<BarangayData[]>([])
    const [ageDistributionData, setAgeDistributionData] = useState<AgeDistributionData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter();

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [categoriesRes, barangayRes, ageRes] = await Promise.all([
                fetch('/api/dashboard/categories'),
                fetch('/api/dashboard/barangay-distribution'),
                fetch('/api/dashboard/age-distribution')
            ])

            if (!categoriesRes.ok || !barangayRes.ok || !ageRes.ok) {
                throw new Error('Failed to fetch dashboard data')
            }

            const [categories, barangay, age] = await Promise.all([
                categoriesRes.json(),
                barangayRes.json(),
                ageRes.json()
            ])

            setCategoriesData(categories.data)
            setBarangayData(barangay.data)
            setAgeDistributionData(age.data)
        } catch (err) {
            console.error('Error fetching dashboard data:', err)
            setError('Failed to load dashboard data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* First Row - Counts and Quick Actions */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* 40% DashboardCountsCard */}
                <Card className="lg:w-3/5 w-full">
                    <DashboardCountsCard />
                </Card>

                {/* 40% Senior Categories */}
                <Card className="lg:w-2/5 w-full p-10 pt-20">
                    <CardHeader>
                        <CardTitle>Senior Categories</CardTitle>
                        <CardDescription>Distribution by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoriesData.length === 0 ? (
                            <div className="flex items-center justify-center h-[250px] text-gray-500">
                                No category data available
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={categoriesData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoriesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* 20% Quick Actions */}
                <Card className="lg:w-1/5 w-full">
                    <CardHeader>
                        <CardTitle className="text-center pt-10">Quick Actions</CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 flex flex-col items-center space-y-4">

                        <button
                            onClick={() => router.push("/admin/applicants")}
                            className="w-full p-3 cursor-pointer bg-orange-50 hover:bg-orange-100 rounded-lg flex items-center justify-center space-x-3"
                        >
                            <Users className="h-5 w-5 text-orange-600" />
                            <span>Applicants</span>
                        </button>

                        <button
                            onClick={() => router.push("/admin/pending-monitoring")}
                            className="w-full p-3 cursor-pointer bg-green-50 hover:bg-green-100 rounded-lg flex items-center justify-center space-x-3"
                        >
                            <UserCheck className="h-5 w-5 text-green-600" />
                            <span>Pending Approvals</span>
                        </button>

                        <button
                            onClick={() => router.push("/admin/record")}
                            className="w-full p-3 cursor-pointer bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center justify-center space-x-3"
                        >
                            <FileText className="h-5 w-5 text-purple-600" />
                            <span>Generate Reports</span>
                        </button>

                        <button
                            onClick={() => router.push("/admin/overview")}
                            className="w-full p-3 cursor-pointer bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center space-x-3"
                        >
                            <Shield className="h-5 w-5 text-blue-600" />
                            <span>Monitor Applicants</span>
                        </button>
                    </CardContent>
                </Card>


            </div>

            {/* Second Row - Registration Trends (Combined Monthly/Yearly) */}
            <div className="grid grid-cols-1 gap-6">
                <RegistrationTrendsChart />
            </div>

            {/* Third Row - Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChartComponent
                    title="Age Distribution by Gender"
                    description="Senior age groups by gender"
                    chartData={ageDistributionData as Record<string, unknown>[]}
                    chartConfig={{
                        male: { label: 'Male', color: '#3b82f6' },
                        female: { label: 'Female', color: '#ec4899' }
                    }}
                    xAxisKey="ageGroup"
                />

                <BarChartComponent
                    title="Barangay Distribution"
                    description="Seniors across barangays"
                    chartData={barangayData as Record<string, unknown>[]}
                    chartConfig={{
                        pwd: { label: 'PWD', color: '#8b5cf6' },
                        regular: { label: 'Regular', color: '#22c55e' }
                    }}
                    xAxisKey="barangay"
                />
            </div>
        </div>
    )
}

export default DashboardPage
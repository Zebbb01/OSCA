// app/(protected)/admin/dashboard/page.tsx
'use client'

import { BarChartComponent } from '@/components/bar-chart'
import { ChartConfig } from '@/components/ui/chart'
import { DashboardCountsCard } from '@/components/dashboard-counts-card'
import { RegistrationTrendsChart } from '@/components/registration-trends-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Users, UserCheck, FileText, Shield } from 'lucide-react'

// Enhanced chart data
const seniorCategoriesData = [
    { name: 'Regular', value: 650, color: '#22c55e' },
    { name: 'PWD', value: 120, color: '#3b82f6' },
    { name: 'Low Income', value: 85, color: '#f59e0b' },
    { name: 'Special Cases', value: 45, color: '#ef4444' }
]

const barangayDistributionData = [
    { barangay: 'Brgy 1', seniors: 45, pwd: 8, regular: 37 },
    { barangay: 'Brgy 2', seniors: 32, pwd: 5, regular: 27 },
    { barangay: 'Brgy 3', seniors: 58, pwd: 12, regular: 46 },
    { barangay: 'Brgy 4', seniors: 41, pwd: 7, regular: 34 },
    { barangay: 'Brgy 5', seniors: 29, pwd: 4, regular: 25 },
    { barangay: 'Brgy 6', seniors: 67, pwd: 15, regular: 52 }
]

const ageDistributionData = [
    { ageGroup: '60-65', male: 120, female: 145 },
    { ageGroup: '66-70', male: 98, female: 112 },
    { ageGroup: '71-75', male: 76, female: 89 },
    { ageGroup: '76-80', male: 54, female: 67 },
    { ageGroup: '81-85', male: 32, female: 41 },
    { ageGroup: '85+', male: 18, female: 25 }
]

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
    return (
        <div className="space-y-6 p-6">
            {/* First Row - Counts and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <DashboardCountsCard />
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <button className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Users className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium">Add Applicants</p>
                                    </div>
                                </div>
                            </button>
                            <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                                <div className="flex items-center space-x-3">
                                    <UserCheck className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Pending Approvals</p>
                                    </div>
                                </div>
                            </button>
                            <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                                <div className="flex items-center space-x-3">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="font-medium">Generate Reports</p>
                                    </div>
                                </div>
                            </button>
                            <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Manage Staff</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Second Row - Registration Trends (Combined Monthly/Yearly) */}
            <div className="grid grid-cols-1 gap-6">
                <RegistrationTrendsChart />
            </div>

            {/* Third Row - Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Senior Categories</CardTitle>
                        <CardDescription>Distribution by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={seniorCategoriesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {seniorCategoriesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <BarChartComponent
                    title="Age Distribution by Gender"
                    description="Senior age groups by gender"
                    chartData={ageDistributionData}
                    chartConfig={{
                        male: { label: 'Male', color: '#3b82f6' },
                        female: { label: 'Female', color: '#ec4899' }
                    }}
                    xAxisKey="ageGroup"
                />

                <BarChartComponent
                    title="Barangay Distribution"
                    description="Seniors across barangays"
                    chartData={barangayDistributionData}
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
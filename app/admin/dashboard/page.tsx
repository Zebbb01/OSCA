'use client'

import { BarChartComponent } from '@/components/bar-chart'
import LineChartComponent from '@/components/line-chart'
import { ChartConfig } from '@/components/ui/chart'
import { DashboardCountsCard } from '@/components/dashboard-counts-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter } from 'recharts'
import { Users, UserCheck, Calendar, TrendingUp, Activity, MapPin, FileText, Shield } from 'lucide-react'

// Original chart data
const monthlyRegisteredChartData = [
    { month: 'January', seniors: 186 },
    { month: 'February', seniors: 305 },
    { month: 'March', seniors: 237 },
    { month: 'April', seniors: 73 },
    { month: 'May', seniors: 209 },
    { month: 'June', seniors: 214 },
]

const yearlyRegisteredChartData = [
    { year: '2022', seniors: 73 },
    { year: '2023', seniors: 209 },
    { year: '2024', seniors: 214 },
    { year: '2025', seniors: 300 },
]

// Enhanced chart data for admin dashboard
const seniorCategoriesData = [
    { name: 'Regular', value: 650, color: '#22c55e' },
    { name: 'PWD', value: 120, color: '#3b82f6' },
    { name: 'Low Income', value: 85, color: '#f59e0b' },
    { name: 'Special Cases', value: 45, color: '#ef4444' }
]

const barangayDistributionData = [
    { barangay: 'Barangay 1', seniors: 45, pwd: 8, regular: 37 },
    { barangay: 'Barangay 2', seniors: 32, pwd: 5, regular: 27 },
    { barangay: 'Barangay 3', seniors: 58, pwd: 12, regular: 46 },
    { barangay: 'Barangay 4', seniors: 41, pwd: 7, regular: 34 },
    { barangay: 'Barangay 5', seniors: 29, pwd: 4, regular: 25 },
    { barangay: 'Barangay 6', seniors: 67, pwd: 15, regular: 52 }
]

const staffActivityData = [
    { month: 'Jan', registrations: 45, updates: 23, verifications: 31 },
    { month: 'Feb', registrations: 52, updates: 31, verifications: 28 },
    { month: 'Mar', registrations: 38, updates: 18, verifications: 35 },
    { month: 'Apr', registrations: 61, updates: 29, verifications: 42 },
    { month: 'May', registrations: 43, updates: 25, verifications: 38 },
    { month: 'Jun', registrations: 55, updates: 33, verifications: 29 }
]

const ageDistributionData = [
    { ageGroup: '60-65', male: 120, female: 145 },
    { ageGroup: '66-70', male: 98, female: 112 },
    { ageGroup: '71-75', male: 76, female: 89 },
    { ageGroup: '76-80', male: 54, female: 67 },
    { ageGroup: '81-85', male: 32, female: 41 },
    { ageGroup: '85+', male: 18, female: 25 }
]

// Admin-specific metrics
const adminMetrics = [
    {
        title: 'Active Staff',
        value: '12',
        change: '+2',
        icon: Shield,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
    },
    {
        title: 'Pending Verifications',
        value: '23',
        change: '-5',
        icon: FileText,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
    },
    {
        title: 'System Uptime',
        value: '99.8%',
        change: '+0.1%',
        icon: Activity,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
    },
    {
        title: 'Data Accuracy',
        value: '97.2%',
        change: '+1.2%',
        icon: TrendingUp,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
    }
]

const chartConfig = {
    seniors: {
        label: 'Senior',
        color: '#4ade80',
    },
    registrations: {
        label: 'Registrations',
        color: '#22c55e',
    },
    updates: {
        label: 'Updates',
        color: '#3b82f6',
    },
    verifications: {
        label: 'Verifications',
        color: '#f59e0b',
    },
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Senior Counts Section */}
                <Card>
                    <DashboardCountsCard />
                </Card>

                {/* Quick Admin Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Admin Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">Manage Staff</p>
                                        <p className="text-xs text-gray-600">Add or edit staff accounts</p>
                                    </div>
                                </div>
                            </button>
                            <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                                <div className="flex items-center space-x-3">
                                    <UserCheck className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Pending Approvals</p>
                                        <p className="text-xs text-gray-600">Review senior registrations</p>
                                    </div>
                                </div>
                            </button>
                            <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                                <div className="flex items-center space-x-3">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="font-medium">Generate Reports</p>
                                        <p className="text-xs text-gray-600">Create system reports</p>
                                    </div>
                                </div>
                            </button>
                            <button className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                                <div className="flex items-center space-x-3">
                                    <Activity className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <p className="font-medium">System Settings</p>
                                        <p className="text-xs text-gray-600">Configure system parameters</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Third row - Original charts enhanced */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChartComponent
                    title="Monthly Registered Seniors"
                    description="Monthly registration trends with admin insights"
                    chartData={monthlyRegisteredChartData}
                    chartConfig={chartConfig}
                    xAxisKey="month"
                />

                <LineChartComponent
                    title="Yearly Registration Growth"
                    description="Long-term senior registration trends"
                    chartData={yearlyRegisteredChartData}
                    chartConfig={chartConfig}
                    xAxisKey="year"
                />
            </div>

            {/* Admin-specific metrics */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {adminMetrics.map((metric, index) => {
                    const Icon = metric.icon
                    return (
                        <Card key={index} className="relative overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                                        <p className="text-2xl font-bold">{metric.value}</p>
                                        <p className={`text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                            {metric.change} from last month
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full ${metric.bgColor}`}>
                                        <Icon className={`h-6 w-6 ${metric.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div> */}

            {/* First row of charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Senior Categories Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Senior Categories Distribution</CardTitle>
                        <CardDescription>Breakdown by senior citizen categories</CardDescription>
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
                    description="Senior citizen age groups by gender"
                    chartData={ageDistributionData}
                    chartConfig={{
                        male: { label: 'Male', color: '#3b82f6' },
                        female: { label: 'Female', color: '#ec4899' }
                    }}
                    xAxisKey="ageGroup"
                />

                <BarChartComponent
                    title="Barangay Distribution"
                    description="Senior distribution across barangays"
                    chartData={barangayDistributionData}
                    chartConfig={{
                        pwd: { label: 'PWD', color: '#8b5cf6' },
                        regular: { label: 'Regular', color: '#22c55e' }
                    }}
                    xAxisKey="barangay"
                />
            </div>

            {/* Second row - Age Distribution and Barangay Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            </div>



            {/* System Health and Quick Actions */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>System Health Monitor</CardTitle>
                        <CardDescription>Real-time system performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Database Performance</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                    <span className="text-sm">92%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">API Response Time</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                                    </div>
                                    <span className="text-sm">156ms</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Server Load</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                                    </div>
                                    <span className="text-sm">67%</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Storage Usage</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '74%' }}></div>
                                    </div>
                                    <span className="text-sm">74%</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div> */}
        </div>
    )
}

export default DashboardPage
'use client'

import { BarChartComponent } from '@/components/bar-chart'
import LineChartComponent from '@/components/line-chart'
import { ChartConfig } from '@/components/ui/chart'
import { DashboardCountsCard } from '@/components/dashboard-counts-card'; // Import the new component

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

const chartConfig = {
    seniors: {
        label: 'Senior',
        color: '#4ade80',
    },
} satisfies ChartConfig

const DashboardPage = () => {
    return (
        <>
            <div className="grid auto-rows-min gap-4 md:grid-cols-2 mt-8">
                {/* Senior Counts Section - now a component */}
                <DashboardCountsCard /> 

                <BarChartComponent
                    title="Monthly Registered Senior"
                    description="Count of registered senior by month"
                    chartData={monthlyRegisteredChartData}
                    chartConfig={chartConfig}
                    xAxisKey="month"
                />

                <LineChartComponent
                    title="Yearly Registered Senior"
                    description="Count of registered senior by year"
                    chartData={yearlyRegisteredChartData}
                    chartConfig={chartConfig}
                    xAxisKey="year"
                />
            </div>
        </>
    )
}

export default DashboardPage
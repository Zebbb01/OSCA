// app/staff/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { RegistrationTrendsChart } from '@/components/registration-trends-chart'
import { Loader2 } from 'lucide-react'
import { BarChartComponent } from '@/components/bar-chart'
import { ChartConfig } from '@/components/ui/chart'

interface CategoryData {
  name: string
  value: number
  color: string
}

interface StatsData {
  totalSeniors: number
  totalApplications: number
  pendingSeniors: number
  pwdCount: number
  lowIncomeCount: number
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
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ageDistributionData, setAgeDistributionData] = useState<AgeDistributionData[]>([])
  const [barangayData, setBarangayData] = useState<BarangayData[]>([])
  const [seniorCounts, setSeniorCounts] = useState<any>(null)


  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsRes, categoriesRes, barangayRes, ageRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/categories'),
        fetch('/api/dashboard/barangay-distribution'),
        fetch('/api/dashboard/age-distribution')
      ])

      const seniorCountsRes = await fetch('/api/seniors/counts')

      if (!seniorCountsRes.ok) {
        throw new Error('Failed to fetch senior counts')
      }

      const seniorCountsJson = await seniorCountsRes.json()
      setSeniorCounts(seniorCountsJson)


      if (!statsRes.ok || !categoriesRes.ok || !barangayRes.ok || !ageRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [stats, categories, barangay, age] = await Promise.all([
        statsRes.json(),
        categoriesRes.json(),
        barangayRes.json(),
        ageRes.json()
      ])

      setStatsData(stats.data)                // 👉 FIXED: store statistics
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
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Total Seniors */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Seniors</CardDescription>
            <CardTitle className="text-3xl">
              {seniorCounts?.totalSeniors ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Total Applications */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Seniors Applied for Benefits</CardDescription>
            <CardTitle className="text-3xl">
              {seniorCounts?.totalSeniorsAppliedForBenefits ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Pending → Newly Registered */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Newly Registered Seniors</CardDescription>
            <CardTitle className="text-3xl">
              {seniorCounts?.newlyRegisteredSeniors ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* PWD Seniors */}
        {/* <Card>
          <CardHeader className="pb-2">
            <CardDescription>PWD Seniors</CardDescription>
            <CardTitle className="text-3xl">
              {seniorCounts?.totalPwdSeniors ?? 0}
            </CardTitle>
          </CardHeader>
        </Card> */}

      </div>


      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Senior Categories Donut Chart */}
        <Card>
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
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Registration Trends */}
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
          title="Barangay Distribution by Category"
          description="Senior categories across barangays"
          chartData={barangayData as Record<string, unknown>[]}
          chartConfig={{
            'Regular (Below 80)': { label: 'Regular (Below 80)', color: '#22c55e' },
            'Octogenarian (80-89)': { label: 'Octogenarian (80-89)', color: '#3b82f6' },
            'Nonagenarian (90-99)': { label: 'Nonagenarian (90-99)', color: '#f59e0b' },
            'Centenarian (100+)': { label: 'Centenarian (100+)', color: '#ef4444' }
          }}
          xAxisKey="barangay"
        />
      </div>
    </div>
  )
}

export default DashboardPage
// components/registration-trends-chart.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

interface RegistrationData {
    month?: string
    year?: string
    seniors: number
}

interface ApiResponse {
    view: 'monthly' | 'yearly'
    year?: number
    data: RegistrationData[]
}

const YEAR_START = 2025
const YEAR_END = 2030

const chartConfig = {
    seniors: {
        label: 'Seniors',
        color: '#22c55e',
    },
}

export const RegistrationTrendsChart = () => {
    const [view, setView] = useState<'monthly' | 'yearly'>('monthly')
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const [data, setData] = useState<RegistrationData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/seniors/registration-trends?view=${view}&year=${year}`
                const response = await fetch(url)

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const result: ApiResponse = await response.json()

                if (view === 'yearly') {
                    setData(fillYearRange(result.data))
                } else {
                    setData(result.data)
                }

                setError(null)
            } catch (error: any) {
                console.error('Error fetching registration trends:', error)
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [view, year])

    // Fill missing years from 2025–2030
    const fillYearRange = (data: RegistrationData[]) => {
        const fullData: RegistrationData[] = []

        for (let y = YEAR_START; y <= YEAR_END; y++) {
            const existing = data.find(d => Number(d.year) === y)
            fullData.push(existing || { year: String(y), seniors: 0 })
        }

        return fullData
    }

    const handleYearChange = (direction: 'prev' | 'next') => {
        setYear(prev => direction === 'prev' ? prev - 1 : prev + 1)
    }

    const xAxisKey = view === 'monthly' ? 'month' : 'year'
    const currentYear = new Date().getFullYear()

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Registration of Seniors Trends</CardTitle>
                        <CardDescription>
                            {view === 'monthly'
                                ? `Monthly registrations for ${year}`
                                : `Yearly registrations (2025–2030)`}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={view === 'monthly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('monthly')}
                        >
                            Monthly
                        </Button>
                        <Button
                            variant={view === 'yearly' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('yearly')}
                        >
                            Yearly
                        </Button>
                    </div>
                </div>

                {view === 'monthly' && (
                    <div className="flex items-center gap-2 mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleYearChange('prev')}
                        >
                            ←
                        </Button>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{year}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleYearChange('next')}
                            disabled={year >= currentYear}
                        >
                            →
                        </Button>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                {loading && (
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                )}

                {error && (
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-red-500">Error: {error}</p>
                    </div>
                )}

                {!loading && !error && data.length > 0 && (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey={xAxisKey}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    angle={view === 'monthly' ? -45 : 0}
                                    textAnchor={view === 'monthly' ? 'end' : 'middle'}
                                    height={60}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    allowDecimals={false}
                                />
                                <ChartTooltip
                                    content={<ChartTooltipContent />}
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                />
                                <Bar
                                    dataKey="seniors"
                                    fill={chartConfig.seniors.color}
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                )}

                {!loading && !error && data.length === 0 && (
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">No registration data available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

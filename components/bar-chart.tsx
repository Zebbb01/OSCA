// components/bar-chart.tsx
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartProps } from '@/types/chart'

export const BarChartComponent = <T extends Record<string, unknown>>({
    title,
    description,
    chartData,
    chartConfig,
    xAxisKey,
}: ChartProps<T>) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey={xAxisKey as string}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                allowDecimals={false}
                                tick={{ fontSize: 12 }}
                            />
                            <ChartTooltip 
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
                                content={<ChartTooltipContent />} 
                            />

                            {/* DYNAMIC BAR CHART DATA DEPENDS ON THE GIVEN CONFIG */}
                            {Object.keys(chartConfig).map((key) => (
                                <Bar 
                                    key={key} 
                                    dataKey={key} 
                                    fill={chartConfig[key].color}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
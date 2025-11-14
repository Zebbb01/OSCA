'use client'

import { BarChartComponent } from '@/components/bar-chart'
import LineChartComponent from '@/components/line-chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Tooltip,
} from 'recharts'
import { ChartConfig } from '@/components/ui/chart'

// 📊 Chart Config
const chartConfig = {
  seniors: { label: 'Senior', color: '#4ade80' },
  registrations: { label: 'Registrations', color: '#22c55e' },
  updates: { label: 'Updates', color: '#3b82f6' },
  verifications: { label: 'Verifications', color: '#f59e0b' },
  male: { label: 'Male', color: '#3b82f6' },
  female: { label: 'Female', color: '#ec4899' },
  pwd: { label: 'PWD', color: '#8b5cf6' },
  regular: { label: 'Regular', color: '#22c55e' },
} satisfies ChartConfig

// 📈 Dummy Data
const pageViewsData = [
  { name: 'Desktop', value: 65, color: '#22c55e' },
  { name: 'Mobile', value: 25, color: '#3b82f6' },
  { name: 'Tablet', value: 10, color: '#f59e0b' },
]

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

const bubbleData = [
  { x: 30, y: 40, z: 100, country: 'USA', color: '#93c5fd' },
  { x: 45, y: 25, z: 80, country: 'UK', color: '#ddd6fe' },
  { x: 60, y: 60, z: 60, country: 'Germany', color: '#fed7aa' },
  { x: 20, y: 70, z: 40, country: 'France', color: '#fde68a' },
  { x: 80, y: 30, z: 120, country: 'Japan', color: '#a7f3d0' },
]

const nrrData = [
  { month: 'Jan', new: 400, returning: 800 },
  { month: 'Feb', new: 500, returning: 900 },
  { month: 'Mar', new: 600, returning: 700 },
  { month: 'Apr', new: 450, returning: 650 },
  { month: 'May', new: 300, returning: 500 },
]

const productData = [
  { product: 'Product A', value: 85 },
  { product: 'Product B', value: 92 },
  { product: 'Product C', value: 78 },
  { product: 'Product D', value: 88 },
  { product: 'Product E', value: 95 },
]

// 🧩 Main Dashboard
const DashboardPage = () => {
  return (
    <div className="p-6 space-y-6">
      {/* ====== 1️⃣ Chart Row 1 ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page Views Donut Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Page Views</CardTitle>
            <CardDescription>Traffic by device type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pageViewsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pageViewsData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pageViewsData.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Bar Chart */}
        <BarChartComponent
          title="Monthly Registered Seniors"
          description="Monthly registration trends"
          chartData={monthlyRegisteredChartData}
          chartConfig={chartConfig}
          xAxisKey="month"
        />

        {/* Yearly Line Chart */}
        <LineChartComponent
          title="Yearly Registration Growth"
          description="Long-term senior registration trends"
          chartData={yearlyRegisteredChartData}
          chartConfig={chartConfig}
          xAxisKey="year"
        />
      </div>

      {/* ====== 2️⃣ Chart Row 2 ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bubble Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              NRR Stats by Country
            </CardTitle>
            <CardDescription>Regional engagement insights</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <XAxis type="number" dataKey="x" hide />
                <YAxis type="number" dataKey="y" hide />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) =>
                    `Country: ${
                      bubbleData.find((d) => d.x === label)?.country || ''
                    }`
                  }
                />
                <Scatter data={bubbleData}>
                  {bubbleData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NRR Stacked Bar Chart */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">NRR Overview</CardTitle>
            <CardDescription>New vs returning members</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={nrrData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="new" stackId="a" fill="#f59e0b" />
                <Bar dataKey="returning" stackId="a" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ====== 3️⃣ Chart Row 3 ====== */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Net NRR by Product
          </CardTitle>
          <CardDescription>Performance comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {productData.map((product, i) => (
              <div key={i} className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2">
                  <div className="h-24 flex items-end justify-center">
                    <div
                      className="w-full bg-green-400 rounded-t"
                      style={{ height: `${product.value}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-600">{product.product}</div>
                <div className="text-sm font-medium">{product.value}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage

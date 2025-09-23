'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, Tooltip, Legend } from 'recharts'

// Key metrics data
const keyMetrics = [
  {
    title: 'New Users',
    value: '230',
    change: '+25%',
    changeType: 'positive' as const,
    period: 'All Users',
    subtitle: 'All members'
  },
  {
    title: 'Bounce Rate',
    value: '9.86%',
    change: '+25%',
    changeType: 'positive' as const,
    period: 'All Users',
    subtitle: 'All members'
  },
  {
    title: 'New MRR',
    value: '$25,690',
    change: '+8.7%',
    changeType: 'positive' as const,
    period: 'New MRR',
    subtitle: 'All members'
  },
  {
    title: 'Average New MRR',
    value: '$558.48',
    change: '+3.3%',
    changeType: 'positive' as const,
    period: 'Average New MRR',
    subtitle: 'All members'
  },
  {
    title: 'Monthly to Renew LTV',
    value: '0.34',
    change: '+9.4%',
    changeType: 'positive' as const,
    period: 'Monthly to Renew LTV',
    subtitle: 'All members'
  }
]

// Page Views donut chart data
const pageViewsData = [
  { name: 'Desktop', value: 65, color: '#22c55e' },
  { name: 'Mobile', value: 25, color: '#3b82f6' },
  { name: 'Tablet', value: 10, color: '#f59e0b' }
]

// NRR Stats by Country bubble chart data
const bubbleData = [
  { x: 30, y: 40, z: 100, country: 'USA', color: '#93c5fd' },
  { x: 45, y: 25, z: 80, country: 'UK', color: '#ddd6fe' },
  { x: 60, y: 60, z: 60, country: 'Germany', color: '#fed7aa' },
  { x: 20, y: 70, z: 40, country: 'France', color: '#fde68a' },
  { x: 80, y: 30, z: 120, country: 'Japan', color: '#a7f3d0' }
]

// NRR stacked bar chart data
const nrrData = [
  { month: 'Jan', new: 400, returning: 800, total: 1200 },
  { month: 'Feb', new: 500, returning: 900, total: 1400 },
  { month: 'Mar', new: 600, returning: 700, total: 1300 },
  { month: 'Apr', new: 450, returning: 650, total: 1100 },
  { month: 'May', new: 300, returning: 500, total: 800 }
]

// Net NRR by Product data
const productData = [
  { product: 'Product A', value: 85 },
  { product: 'Product B', value: 92 },
  { product: 'Product C', value: 78 },
  { product: 'Product D', value: 88 },
  { product: 'Product E', value: 95 }
]

const DashboardPage = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index} className="bg-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardDescription className="text-xs text-gray-500">
                  {metric.period}
                </CardDescription>
                <CardDescription className="text-xs text-gray-400">
                  {metric.subtitle}
                </CardDescription>
              </div>
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-sm text-green-600">{metric.change}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page Views Donut Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base font-medium">Page Views</CardTitle>
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
                  {pageViewsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pageViewsData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span>{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NRR Stats by Country Bubble Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base font-medium">NRR Stats by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart data={bubbleData}>
                <XAxis type="number" dataKey="x" domain={[0, 100]} hide />
                <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => `Country: ${bubbleData.find(d => d.x === label)?.country || ''}`}
                />
                <Scatter dataKey="z" fill="#8884d8">
                  {bubbleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* NRR Stacked Bar Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-base font-medium">NRR</CardTitle>
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

      {/* Net NRR by Product */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base font-medium">Net NRR by Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {productData.map((product, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-2">
                  <div className="h-20 bg-gradient-to-t from-green-200 to-green-100 rounded flex items-end justify-center">
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
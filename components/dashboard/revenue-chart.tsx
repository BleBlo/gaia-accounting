'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface RevenueChartProps {
  data?: { date: string; amount: number }[]
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(value)
  }

  return (
    <Card className="border-neutral-200">
      <CardHeader>
        <CardTitle className="text-lg text-neutral-900">Revenue (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] lg:h-[300px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 12 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                  labelStyle={{ color: '#171717', fontWeight: 600 }}
                />
                <Bar
                  dataKey="amount"
                  fill="#171717"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-neutral-50 rounded-lg">
              <p className="text-neutral-400 text-sm">Loading chart...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { TrendingUp, AlertTriangle } from "lucide-react"

interface DailySpendingChartProps {
  data: Array<{
    date: string
    total_spent: number
    total_received: number
    transaction_count: number
  }>
}

export function DailySpendingChart({ data }: DailySpendingChartProps) {
  // Calculate average and identify unusual days
  const avgSpent = data.reduce((sum, d) => sum + d.total_spent, 0) / data.length
  const stdDev = Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d.total_spent - avgSpent, 2), 0) / data.length)

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    spent: d.total_spent,
    received: d.total_received,
    isUnusual: Math.abs(d.total_spent - avgSpent) > stdDev * 2,
  }))

  return (
    <Card className="border-red-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-red-900">Daily Spending (30 Days)</CardTitle>
            <CardDescription className="text-red-700">Spendable token activity over time</CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-red-600" />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            spent: {
              label: "Spent",
              color: "hsl(0, 84%, 60%)",
            },
            received: {
              label: "Received",
              color: "hsl(25, 95%, 53%)",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 84%, 90%)" />
              <XAxis dataKey="date" stroke="hsl(0, 84%, 40%)" fontSize={12} />
              <YAxis stroke="hsl(0, 84%, 40%)" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="spent" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorSpent)" />
              <Area
                type="monotone"
                dataKey="received"
                stroke="hsl(25, 95%, 53%)"
                fillOpacity={1}
                fill="url(#colorReceived)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        {chartData.some((d) => d.isUnusual) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-orange-700 bg-orange-50 p-3 rounded-md border border-orange-200">
            <AlertTriangle className="h-4 w-4" />
            <span>Unusual activity detected on some days (2+ standard deviations from average)</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Activity } from "lucide-react"

interface DailyTransactionsChartProps {
  data: Array<{
    date: string
    transaction_count: number
  }>
}

export function DailyTransactionsChart({ data }: DailyTransactionsChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: d.transaction_count,
  }))

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-orange-900">Daily Transactions (30 Days)</CardTitle>
            <CardDescription className="text-orange-700">Transaction count per day</CardDescription>
          </div>
          <Activity className="h-5 w-5 text-orange-600" />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Transactions",
              color: "hsl(25, 95%, 53%)",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(25, 95%, 90%)" />
              <XAxis dataKey="date" stroke="hsl(25, 95%, 40%)" fontSize={12} />
              <YAxis stroke="hsl(25, 95%, 40%)" fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

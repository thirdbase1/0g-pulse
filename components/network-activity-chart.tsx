"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp } from "lucide-react"

interface NetworkActivityChartProps {
  data: Array<{
    date: string
    total_wallets: number
    daily_active_wallets: number
    total_transaction_volume: number
  }>
}

export function NetworkActivityChart({ data }: NetworkActivityChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    wallets: d.total_wallets,
    activeWallets: d.daily_active_wallets,
    volume: d.total_transaction_volume,
  }))

  if (!data || data.length === 0) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-red-900">Network Activity (30 Days)</CardTitle>
              <CardDescription className="text-red-700">Daily active wallets and transaction volume</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No historical data available yet. Data will appear as wallets are tracked over time.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-red-900">Network Activity (30 Days)</CardTitle>
            <CardDescription className="text-red-700">Daily active wallets and transaction volume</CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-red-600" />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            activeWallets: {
              label: "Active Wallets",
              color: "hsl(0, 84%, 60%)",
            },
            volume: {
              label: "Transaction Volume",
              color: "hsl(25, 95%, 53%)",
            },
          }}
          className="h-[300px] sm:h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 84%, 90%)" />
              <XAxis dataKey="date" stroke="hsl(0, 84%, 40%)" fontSize={12} angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" stroke="hsl(0, 84%, 60%)" fontSize={12} width={60} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(25, 95%, 53%)" fontSize={12} width={60} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="activeWallets"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2}
                dot={{ fill: "hsl(0, 84%, 60%)", r: 4 }}
                name="Active Wallets"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="volume"
                stroke="hsl(25, 95%, 53%)"
                strokeWidth={2}
                dot={{ fill: "hsl(25, 95%, 53%)", r: 4 }}
                name="Transaction Volume"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

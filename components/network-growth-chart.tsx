"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Users } from "lucide-react"

interface NetworkGrowthChartProps {
  data: Array<{
    date: string
    total_wallets: number
  }>
}

export function NetworkGrowthChart({ data }: NetworkGrowthChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    wallets: d.total_wallets,
  }))

  if (!data || data.length === 0) {
    return (
      <Card className="border-orange-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-orange-900">Network Growth</CardTitle>
              <CardDescription className="text-orange-700">Total wallets over time</CardDescription>
            </div>
            <Users className="h-5 w-5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No historical data available yet. Data will appear as wallets are tracked over time.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-orange-900">Network Growth</CardTitle>
            <CardDescription className="text-orange-700">Total wallets over time</CardDescription>
          </div>
          <Users className="h-5 w-5 text-orange-600" />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            wallets: {
              label: "Total Wallets",
              color: "hsl(25, 95%, 53%)",
            },
          }}
          className="h-[250px] sm:h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorWallets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(25, 95%, 90%)" />
              <XAxis dataKey="date" stroke="hsl(25, 95%, 40%)" fontSize={12} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="hsl(25, 95%, 40%)" fontSize={12} width={60} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="wallets"
                stroke="hsl(25, 95%, 53%)"
                fillOpacity={1}
                fill="url(#colorWallets)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

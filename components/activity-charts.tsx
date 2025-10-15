"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Activity, TrendingDown } from "lucide-react"

interface ActivityChartsProps {
  dailyActivity: Record<
    string,
    {
      txCount: number
      volume: number
      sent: number
      received: number
    }
  >
  walletBirthday: string | null
}

export function ActivityCharts({ dailyActivity, walletBirthday }: ActivityChartsProps) {
  const generateDateRange = () => {
    if (!walletBirthday) return []

    const start = new Date(walletBirthday)
    const end = new Date()
    const dates: string[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0])
    }

    return dates
  }

  const allDates = generateDateRange()
  const last30Dates = allDates.slice(-30)

  const activityData = last30Dates.map((date) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    transactions: dailyActivity[date]?.txCount || 0,
    volume: dailyActivity[date]?.volume || 0,
    sent: dailyActivity[date]?.sent || 0,
    received: dailyActivity[date]?.received || 0,
    isActive: (dailyActivity[date]?.txCount || 0) > 0,
  }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Daily Activity Chart */}
      <Card className="border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            Daily Activity
          </CardTitle>
          <CardDescription>Active vs Inactive days (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ff6b35" opacity={0.1} />
              <XAxis dataKey="date" stroke="#ff6b35" fontSize={12} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#ff6b35" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid #ff6b35",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#ff6b35" }}
                formatter={(value: number, name: string) => {
                  if (name === "transactions") {
                    return [value === 0 ? "Inactive" : `${value} txs`, "Status"]
                  }
                  return [value, name]
                }}
              />
              <Bar
                dataKey="transactions"
                fill="#ff6b35"
                radius={[8, 8, 0, 0]}
                opacity={(entry: any) => (entry.isActive ? 1 : 0.2)}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Volume Chart */}
      <Card className="border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            Daily Volume
          </CardTitle>
          <CardDescription>Wrapped FOGO sent/received per day (last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ff6b35" opacity={0.1} />
              <XAxis dataKey="date" stroke="#ff6b35" fontSize={12} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#ff6b35" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "1px solid #ff6b35",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#ff6b35" }}
                formatter={(value: number) => [`${value.toFixed(4)} wFOGO`, "Volume"]}
              />
              <Line type="monotone" dataKey="volume" stroke="#ff6b35" strokeWidth={2} dot={{ fill: "#ff6b35" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

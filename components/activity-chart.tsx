"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ActivityChartProps {
  activeDays: number
  inactiveDays: number
  totalDays: number
}

export function ActivityChart({ activeDays, inactiveDays, totalDays }: ActivityChartProps) {
  // Ensure totalDays is at least 1 to avoid division by zero
  const safeTotalDays = Math.max(1, totalDays)
  // Clamp percentages between 0 and 100
  const activePercentage = Math.min(100, Math.max(0, (activeDays / safeTotalDays) * 100))
  const inactivePercentage = Math.min(100, Math.max(0, (inactiveDays / safeTotalDays) * 100))

  return (
    <Card className="border-red-900/20 bg-gradient-to-br from-black to-red-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-500">
          <span>📊</span>
          Activity Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">{activeDays}</div>
            <div className="text-sm text-gray-400">Active Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-500">{inactiveDays}</div>
            <div className="text-sm text-gray-400">Inactive Days</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{totalDays}</div>
            <div className="text-sm text-gray-400">Total Days</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex h-8 w-full overflow-hidden rounded-lg">
            <div
              className="bg-gradient-to-r from-green-600 to-green-500 transition-all"
              style={{ width: `${activePercentage}%` }}
            />
            <div
              className="bg-gradient-to-r from-gray-700 to-gray-600 transition-all"
              style={{ width: `${inactivePercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{activePercentage.toFixed(1)}% Active</span>
            <span>{inactivePercentage.toFixed(1)}% Inactive</span>
          </div>
        </div>

        <div className="rounded-lg border border-red-900/30 bg-red-950/20 p-3">
          <p className="text-sm text-gray-300">
            This wallet has been active for <span className="font-bold text-red-500">{activeDays}</span> out of{" "}
            <span className="font-bold text-red-500">{totalDays}</span> days since creation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

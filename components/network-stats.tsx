import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, TrendingUp, Zap, Coins } from "lucide-react"

interface NetworkStatsProps {
  totalWallets: number
  dailyActiveWallets: number
  totalTransactionVolume: number
  totalTransactions: number
  totalFees: number
}

export function NetworkStats({
  totalWallets,
  dailyActiveWallets,
  totalTransactionVolume,
  totalTransactions,
  totalFees,
}: NetworkStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const activePercentage = totalWallets > 0 ? ((dailyActiveWallets / totalWallets) * 100).toFixed(1) : "0"

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tracked Wallets</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold">{formatNumber(totalWallets)}</div>
          <p className="text-xs text-muted-foreground mt-1">Wallets analyzed</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-accent/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Active</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold">{formatNumber(dailyActiveWallets)}</div>
          <p className="text-xs text-muted-foreground mt-1">{activePercentage}% of tracked</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold">{formatNumber(totalTransactionVolume)}</div>
          <p className="text-xs text-muted-foreground mt-1">Total tokens moved</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-accent/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          <Zap className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold">{formatNumber(totalTransactions)}</div>
          <p className="text-xs text-muted-foreground mt-1">Transactions tracked</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          <Coins className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-3xl font-bold">{formatNumber(totalFees)}</div>
          <p className="text-xs text-muted-foreground mt-1">Native FOGO</p>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, TrendingDown, Fuel, Calendar, Activity, ExternalLink, Copy, Check } from "lucide-react"
import { EXPLORER_URL } from "@/lib/constants"
import { useState } from "react"

interface WalletOverviewProps {
  data: {
    address: string
    role?: string
    rank?: number
    ageDays?: number
    firstTxDate?: string
    lastActivity?: string
    nativeBalance?: number
    wFOGOBalance?: number
    realBalance?: number
    totalVolume?: number
    totalSent?: number
    totalReceived?: number
    totalFees?: number
    netBalance?: number
    totalTransactions?: number
  }
}

export function WalletOverview({ data }: WalletOverviewProps) {
  const [copied, setCopied] = useState(false)

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRankBadge = () => {
    const volume = data.totalVolume || 0
    if (volume >= 500000) return { label: "🌪️ Wildfire", color: "bg-red-600 text-white" }
    if (volume >= 100000) return { label: "🌋 Blaze", color: "bg-orange-600 text-white" }
    if (volume >= 50000) return { label: "🔥 OG", color: "bg-yellow-600 text-white" }
    if (volume >= 10000) return { label: "✨ Ember", color: "bg-amber-600 text-white" }
    if (volume >= 1000) return { label: "🔥 Flame", color: "bg-orange-500 text-white" }
    return { label: "⚡ Spark", color: "bg-gray-600 text-white" }
  }

  const rankBadge = getRankBadge()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header Card with Wallet Info - Responsive */}
      <Card className="border-red-900/20 bg-gradient-to-br from-black via-red-950/10 to-orange-950/20">
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white">Wallet Address</h2>
                <Badge className={`${rankBadge.color} text-xs`}>{rankBadge.label}</Badge>
                {data.rank && data.rank > 0 && (
                  <Badge variant="outline" className="text-gray-400 border-gray-700 text-xs">
                    Rank #{data.rank}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-mono text-white break-all flex-1">{data.address}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0 h-8 w-8 p-0 hover:bg-red-950/30"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-red-700/50 hover:bg-red-950/50 bg-red-950/30 text-white text-xs flex-1 sm:flex-none"
              >
                <a
                  href={`${EXPLORER_URL.fogo}/address/${data.address}?cluster=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Fogo Explorer <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-orange-700/50 hover:bg-orange-950/50 bg-orange-950/30 text-white text-xs flex-1 sm:flex-none"
              >
                <a
                  href={`${EXPLORER_URL.fogoscan}/address/${data.address}?cluster=testnet#transfers`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FogoScan Transfers <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-red-900/30">
              <div className="flex items-start gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Birthday</p>
                  <p className="text-xs sm:text-sm font-semibold text-red-400 truncate">
                    {formatDate(data.firstTxDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="text-xs sm:text-sm font-semibold text-orange-400">{data.ageDays || 0} days</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Last Active</p>
                  <p className="text-xs sm:text-sm font-semibold text-red-400 truncate">
                    {formatDate(data.lastActivity)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Total TXs</p>
                  <p className="text-xs sm:text-sm font-semibold text-orange-400">{data.totalTransactions || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="border-blue-900/20 bg-gradient-to-br from-black to-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-300">Native FOGO</CardTitle>
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold text-blue-500">{formatNumber(data.nativeBalance || 0)}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-900/20 bg-gradient-to-br from-black to-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-300">Wrapped FOGO</CardTitle>
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold text-purple-500">{formatNumber(data.wFOGOBalance || 0)}</div>
          </CardContent>
        </Card>

        <Card className="border-red-900/20 bg-gradient-to-br from-black to-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-300">Total Balance</CardTitle>
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold text-red-500">{formatNumber(data.realBalance || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="border-orange-900/20 bg-gradient-to-br from-black to-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-300">Total Volume (30d)</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold text-orange-500">{formatNumber(data.totalVolume || 0)}</div>
          </CardContent>
        </Card>

        <Card className="border-red-900/20 bg-gradient-to-br from-black to-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-300">Net Balance</CardTitle>
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold text-red-500">{formatNumber(data.netBalance || 0)}</div>
          </CardContent>
        </Card>

        <Card className="border-orange-900/20 bg-gradient-to-br from-black to-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-300">Gas Fees</CardTitle>
            <Fuel className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="text-lg sm:text-2xl font-bold text-orange-500">{formatNumber(data.totalFees || 0)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

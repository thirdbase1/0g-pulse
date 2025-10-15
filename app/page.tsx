"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { WalletSearch } from "@/components/wallet-search"
import { WalletOverview } from "@/components/wallet-overview"
import { AchievementsDisplay } from "@/components/achievements-display"
import { CATokenBalances } from "@/components/ca-token-balances"
import { TransactionHistory } from "@/components/transaction-history"
import { ActivityChart } from "@/components/activity-chart"
import { ActivityCharts } from "@/components/activity-charts"
import { WelcomeModal } from "@/components/welcome-modal"
import { Button } from "@/components/ui/button"
import { BarChart3, Network, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface WalletData {
  wallet: any
  achievements: any[]
  balances: any
  transactions: any[]
  transfers: any[]
  dailyMetrics: any[]
  dailyActivity: any
  fetchTime?: number
}

export default function HomePage() {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentAddress, setCurrentAddress] = useState<string>("")
  const [fetchTime, setFetchTime] = useState<number>(0)

  const searchParams = useSearchParams()

  useEffect(() => {
    const walletParam = searchParams.get("wallet")
    if (walletParam && !walletData && !isLoading) {
      handleSearch(walletParam)
    }
  }, [searchParams])

  const handleSearch = async (address: string) => {
    setIsLoading(true)
    setError(null)
    setCurrentAddress(address)

    try {
      const response = await fetch(`/api/wallet/complete?address=${address}`)

      if (!response.ok) {
        throw new Error("Failed to fetch wallet data")
      }

      const result = await response.json()

      if (result.success) {
        displayWalletData(result.data, address)
        setFetchTime(result.fetchTime || 0)

        await saveWalletData(result.data)
      } else {
        throw new Error(result.message || "Failed to fetch wallet data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const saveWalletData = async (data: any) => {
    try {
      await fetch("/api/wallet/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletData: data }),
      })
    } catch (error) {
      console.error("[v0] Error saving wallet data:", error)
    }
  }

  const handleRefresh = async () => {
    if (!currentAddress) return
    await handleSearch(currentAddress)
  }

  const computeAchievements = (data: any): string[] => {
    const achievements: string[] = []

    if (data.totalTransactions > 0) achievements.push("First Fire")
    if (data.totalVolume >= 100000) achievements.push("Volcano Rank")
    if (data.ageDays >= 365) achievements.push("Cosmic Flame")
    if (data.ageDays <= 7) achievements.push("New Spark")
    if (data.maxCaBalance >= 10000) achievements.push("CA Whale")
    if (data.uniqueCaContracts >= 3) achievements.push("Multi-token Burner")

    return achievements
  }

  const displayWalletData = (data: any, address: string) => {
    const achievements = data.achievements.map((name: string) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      description: getAchievementDescription(name),
      icon: getAchievementIcon(name),
      unlocked: true,
    }))

    const dailyMetrics = Object.entries(data.dailyActivity).map(([date, activity]: [string, any]) => ({
      date,
      transactions: activity.txCount,
      volume: activity.volume,
    }))

    const activeDays = Object.keys(data.dailyActivity).length
    const totalDays = Math.max(1, data.walletAgeDays)
    const inactiveDays = Math.max(0, totalDays - activeDays)

    console.log("[v0] Display - Active:", activeDays, "Inactive:", inactiveDays, "Total:", totalDays)

    setWalletData({
      wallet: {
        address,
        nativeBalance: data.nativeBalance,
        wFOGOBalance: data.wFOGOBalance,
        realBalance: data.realBalance,
        totalTransactions: data.totalTxCount,
        totalSent: data.stats.totalSent,
        totalReceived: data.stats.totalReceived,
        totalVolume: data.totalVolume,
        totalFees: data.stats.totalFees,
        netBalance: data.realBalance - data.stats.totalFees,
        firstTxDate: data.walletBirthday,
        ageDays: totalDays,
        activeDays: activeDays,
        inactiveDays: inactiveDays,
        lastActivity: data.lastActive,
        role: getRankTitle(data.totalVolume),
        rank: 0,
      },
      achievements,
      balances: {
        native: { balance: data.nativeBalance, symbol: "0G" },
        wFOGO: { balance: data.wFOGOBalance, symbol: "w0G" },
        topCA: data.topCABalances,
        other: data.otherTokens,
      },
      transactions: data.transactions,
      transfers: data.transfers || [],
      dailyMetrics,
      dailyActivity: data.dailyActivity,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <WelcomeModal />

      {isLoading && searchParams.get("wallet") && !walletData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card border-2 border-primary/20 shadow-2xl">
            <div className="text-6xl fire-float fire-glow">🔥</div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="text-xl font-semibold gradient-fire">Loading Wallet Stats...</p>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Fetching complete wallet data from the blockchain. This may take a moment for wallets with many
              transactions.
            </p>
          </div>
        </div>
      )}

      <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12">
                <Image src="/images/fogo-logo.png" alt="Fogo Logo" fill className="object-contain fire-float" />
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold gradient-fire">0GPulse</h1>
            </div>
            <nav className="flex gap-2 w-full sm:w-auto">
              <Button variant="ghost" asChild className="hover:bg-primary/10 flex-1 sm:flex-none text-xs sm:text-sm">
                <Link href="/leaderboard">
                  <BarChart3 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Leaderboard
                </Link>
              </Button>
              <Button variant="ghost" asChild className="hover:bg-accent/10 flex-1 sm:flex-none text-xs sm:text-sm">
                <Link href="/network">
                  <Network className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Network
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex gap-2 w-full max-w-2xl">
              <div className="flex-1">
                <WalletSearch onSearch={handleSearch} isLoading={isLoading} />
              </div>
              {walletData && (
                <Button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  variant="outline"
                  size="icon"
                  className="shrink-0 bg-transparent hover:bg-primary/10"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              )}
            </div>
          </div>

          {fetchTime > 0 && (
            <div className="text-xs sm:text-sm text-muted-foreground text-center p-2 bg-muted/50 rounded-lg">
              ⚡ Fetched in {(fetchTime / 1000).toFixed(2)}s • Real-time blockchain data
            </div>
          )}

          {error && (
            <div className="p-3 sm:p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <p className="font-medium text-sm sm:text-base">{error}</p>
            </div>
          )}

          {walletData && (
            <div className="space-y-4 sm:space-y-6">
              <WalletOverview data={walletData.wallet} />

              {walletData.dailyActivity && Object.keys(walletData.dailyActivity).length > 0 && (
                <ActivityCharts
                  dailyActivity={walletData.dailyActivity}
                  walletBirthday={walletData.wallet.firstTxDate}
                />
              )}

              {walletData.dailyMetrics.length > 0 && (
                <ActivityChart
                  activeDays={walletData.wallet.activeDays}
                  inactiveDays={walletData.wallet.inactiveDays}
                  totalDays={walletData.wallet.ageDays}
                />
              )}

              <AchievementsDisplay achievements={walletData.achievements} />

              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <CATokenBalances
                  topTokens={walletData.balances.topCA}
                  otherTokens={walletData.balances.other}
                  nativeBalance={walletData.balances.native.balance}
                  wFOGOBalance={walletData.balances.wFOGO.balance}
                  totalPortfolioValue={walletData.wallet.realBalance}
                />
                <TransactionHistory
                  transactions={[...walletData.transactions, ...walletData.transfers]}
                  walletAddress={walletData.wallet.address}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border bg-card/50 mt-8 sm:mt-12 lg:mt-16">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
          <div className="text-center mb-6">
            <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">Disclaimer</p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto px-4">
              Fogo Testnet is NOT incentivized and this site is built for fun to help you track your wallet activity.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl fire-glow">🔥</span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <a
                href="https://x.com/ONE_SHOT_SX?t=LCoKG3rkHkjFOcRKzYFgqA&s=09"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Follow us on X</span>
              </a>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Built with <span className="fire-glow">🔥</span> on 0G-Testnet-Galileo Testnet
              </p>
              <p className="text-xs text-muted-foreground">
                © 2025 0GPulse • Created by <span className="font-semibold text-foreground">Second Chance</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function getAchievementDescription(name: string): string {
  const descriptions: Record<string, string> = {
    "First Fire": "Made your first transaction",
    "Consistent Burner": "7-day activity streak",
    "Big Burner": "Single transaction > 10k FOGO",
    "Fast Hands": "5+ transactions in 1 minute",
    "CA Whale": "Holds > 10k of any CA token",
    "Multi-token Burner": "Interacted with 3+ contracts",
    "Volcano Rank": "Total volume > 100k",
    "Cosmic Flame": "Wallet age > 365 days",
    "New Spark": "Joined within last 7 days",
  }
  return descriptions[name] || "Achievement unlocked"
}

function getAchievementIcon(name: string): string {
  const icons: Record<string, string> = {
    "First Fire": "🪄",
    "Consistent Burner": "🔥",
    "Big Burner": "💎",
    "Fast Hands": "⚡",
    "CA Whale": "🐳",
    "Multi-token Burner": "🔥",
    "Volcano Rank": "🌋",
    "Cosmic Flame": "🌌",
    "New Spark": "🌱",
  }
  return icons[name] || "🏆"
}

function getRankTitle(volume: number): string {
  if (volume >= 500000) return "Wildfire"
  if (volume >= 100000) return "Blaze"
  if (volume >= 50000) return "OG"
  if (volume >= 10000) return "Ember"
  if (volume >= 1000) return "Flame"
  return "Spark"
}

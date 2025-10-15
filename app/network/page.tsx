"use client"

import { useState, useEffect } from "react"
import { NetworkStats } from "@/components/network-stats"
import { WelcomeModal } from "@/components/welcome-modal"
import { Button } from "@/components/ui/button"
import { Home, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface NetworkData {
  totalWallets: number
  dailyActiveWallets: number
  totalTransactionVolume: number
  totalTransactions: number
  totalFees: number
}

export default function NetworkPage() {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNetworkData()
  }, [])

  const fetchNetworkData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/network")

      if (!response.ok) {
        throw new Error("Failed to fetch network data")
      }

      const result = await response.json()
      setNetworkData(result.data)
    } catch (err) {
      console.error("Error in fetchNetworkData:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <WelcomeModal />

      <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="fire-float">
                <Image src="/images/fogo-logo.png" alt="Fogo Logo" width={40} height={40} className="object-contain" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                0GPulse
              </h1>
            </div>
            <nav className="flex gap-2">
              <Button variant="ghost" asChild size="sm">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button variant="ghost" asChild size="sm">
                <Link href="/leaderboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Leaderboard
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent px-4">
              Tracked Network Metrics
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
              Statistics for wallets tracked on 0G-Testnet-Galileo (wallets that have been searched)
            </p>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              </div>
              <p className="text-muted-foreground">Loading network data...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <p className="font-medium">Error: {error}</p>
            </div>
          )}

          {networkData && !isLoading && (
            <>
              <NetworkStats
                totalWallets={networkData.totalWallets}
                dailyActiveWallets={networkData.dailyActiveWallets}
                totalTransactionVolume={networkData.totalTransactionVolume}
                totalTransactions={networkData.totalTransactions}
                totalFees={networkData.totalFees}
              />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 rounded-lg bg-card border border-border">
                  <h3 className="text-lg font-semibold mb-2">Network Status</h3>
                  <p className="text-sm text-muted-foreground">
                    The tracked network is currently{" "}
                    <span className="font-bold text-foreground">
                      {networkData.dailyActiveWallets > 0 ? "active" : "inactive"}
                    </span>{" "}
                    with {networkData.dailyActiveWallets} wallets active in the last 24 hours.
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-card border border-border">
                  <h3 className="text-lg font-semibold mb-2">Total Volume</h3>
                  <p className="text-sm text-muted-foreground">
                    A total of{" "}
                    <span className="font-bold text-foreground">
                      {new Intl.NumberFormat("en-US").format(networkData.totalTransactionVolume)}
                    </span>{" "}
                    tokens have been transferred across tracked wallets.
                  </p>
                </div>

                <div className="p-6 rounded-lg bg-card border border-border sm:col-span-2 lg:col-span-1">
                  <h3 className="text-lg font-semibold mb-2">Wallet Growth</h3>
                  <p className="text-sm text-muted-foreground">
                    The network has{" "}
                    <span className="font-bold text-foreground">
                      {new Intl.NumberFormat("en-US").format(networkData.totalWallets)}
                    </span>{" "}
                    tracked wallets that have been analyzed.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-6 sm:py-8">
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

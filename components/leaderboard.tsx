"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flame, TrendingUp, Trophy } from "lucide-react"

interface LeaderboardEntry {
  wallet_address: string
  total_transactions: number
  spendable_token_balance: number
  last_updated: string
  combined_score?: number
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("transactions")

  useEffect(() => {
    fetchLeaderboard(activeTab)
  }, [activeTab])

  async function fetchLeaderboard(type: string) {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?type=${type}`)
      const data = await response.json()
      if (data.success) {
        setLeaderboard(data.data || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-600" />
    return <Flame className="h-4 w-4 text-orange-500" />
  }

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-950/20 to-red-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Trophy className="h-6 w-6 text-orange-500" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top wallets by activity and balance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">
              <Flame className="mr-2 h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="balance">
              <TrendingUp className="mr-2 h-4 w-4" />
              Balance
            </TabsTrigger>
            <TabsTrigger value="combined">
              <Trophy className="mr-2 h-4 w-4" />
              Combined
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-orange-950/20" />
                ))}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No data available yet</div>
            ) : (
              <div className="space-y-2">
                {leaderboard.slice(0, 100).map((entry, index) => (
                  <div
                    key={entry.wallet_address}
                    className="flex items-center justify-between rounded-lg border border-orange-500/10 bg-gradient-to-r from-orange-950/10 to-transparent p-4 transition-all hover:border-orange-500/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <div className="font-mono text-sm">
                          {entry.wallet_address.slice(0, 4)}...{entry.wallet_address.slice(-4)}
                        </div>
                        <div className="text-xs text-muted-foreground">Rank #{index + 1}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {activeTab === "transactions" && (
                        <>
                          <div className="font-bold text-orange-500">{entry.total_transactions.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Transactions</div>
                        </>
                      )}
                      {activeTab === "balance" && (
                        <>
                          <div className="font-bold text-orange-500">
                            {entry.spendable_token_balance.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}{" "}
                            FOGO
                          </div>
                          <div className="text-xs text-muted-foreground">Balance</div>
                        </>
                      )}
                      {activeTab === "combined" && (
                        <>
                          <div className="font-bold text-orange-500">
                            {((entry.combined_score || 0) * 100).toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

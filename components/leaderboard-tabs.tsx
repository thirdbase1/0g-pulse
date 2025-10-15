"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TrendingUp, Wallet, Flame, DollarSign, Fuel, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface LeaderboardEntry {
  address: string
  total_transactions: number
  spendable_token_balance: number
  total_spent: number
  total_received: number
  total_volume: number
  total_gas_fees: number
  combined_score?: number
}

interface LeaderboardData {
  data: LeaderboardEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
  walletRank?: number | null // Added walletRank to interface
}

export function LeaderboardTabs() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("transactions")
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    data: [],
    total: 0,
    page: 1,
    limit: 500,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchedWalletRank, setSearchedWalletRank] = useState<number | null>(null)

  useEffect(() => {
    fetchLeaderboard(activeTab, currentPage, searchQuery)
  }, [activeTab, currentPage])

  const fetchLeaderboard = async (type: string, page: number, search = "") => {
    setIsLoading(true)
    setSearchedWalletRank(null)
    try {
      const url = `/api/leaderboard?type=${type}&page=${page}&limit=500${search ? `&search=${encodeURIComponent(search)}` : ""}`
      const res = await fetch(url)
      const result = await res.json()

      if (result.success) {
        setLeaderboardData({
          data: result.data || [],
          total: result.total || 0,
          page: result.page || 1,
          limit: result.limit || 500,
          totalPages: result.totalPages || 0,
          walletRank: result.walletRank, // Use the actual wallet rank from the API response
        })

        if (search && result.walletRank) {
          setSearchedWalletRank(result.walletRank)
        }
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchLeaderboard(activeTab, 1, searchQuery)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
    setSearchQuery("")
    setSearchedWalletRank(null)
  }

  const handleWalletClick = (address: string) => {
    window.location.href = `/?wallet=${address}`
  }

  const formatNumber = (num: number) => {
    if (num < 0.01 && num > 0) {
      return num.toFixed(6)
    }
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(num)
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
          <span className="text-lg font-bold text-white">1</span>
        </div>
      )
    if (rank === 2)
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-lg">
          <span className="text-lg font-bold text-white">2</span>
        </div>
      )
    if (rank === 3)
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
          <span className="text-lg font-bold text-white">3</span>
        </div>
      )
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
        <span className="text-base font-bold text-white">{rank}</span>
      </div>
    )
  }

  const renderLeaderboard = (type: "transactions" | "balance" | "volume" | "fees" | "combined") => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
          </div>
          <p className="text-red-700">Loading leaderboard...</p>
        </div>
      )
    }

    if (leaderboardData.data.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-red-700">No wallets found</p>
        </div>
      )
    }

    const startRank = (currentPage - 1) * 500

    return (
      <div className="space-y-3">
        {searchedWalletRank && searchQuery && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium">
              Wallet rank: <span className="font-bold">#{searchedWalletRank}</span>
            </p>
          </div>
        )}

        {leaderboardData.data.map((entry, index) => {
          const rank = startRank + index + 1
          const isTopThree = rank <= 3

          return (
            <button
              key={entry.address}
              onClick={() => handleWalletClick(entry.address)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-lg hover:scale-[1.01] cursor-pointer ${
                isTopThree
                  ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-300"
                  : "bg-white border-red-200 hover:border-red-300"
              }`}
            >
              {getRankBadge(rank)}

              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-red-900 font-mono truncate">{shortenAddress(entry.address)}</p>
                <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-red-600">
                  {type === "transactions" && (
                    <span className="font-medium">{formatNumber(entry.total_transactions)} txs</span>
                  )}
                  {type === "balance" && (
                    <span className="font-medium">{formatNumber(entry.spendable_token_balance)} FOGO</span>
                  )}
                  {type === "volume" && <span className="font-medium">{formatNumber(entry.total_volume)} FOGO</span>}
                  {type === "fees" && <span className="font-medium">{formatNumber(entry.total_gas_fees)} FOGO</span>}
                  {type === "combined" && (
                    <>
                      <span>{formatNumber(entry.total_transactions)} txs</span>
                      <span className="text-red-400">•</span>
                      <span>{formatNumber(entry.spendable_token_balance)} bal</span>
                      <span className="text-red-400">•</span>
                      <span>{formatNumber(entry.total_volume)} vol</span>
                      <span className="text-red-400">•</span>
                      <span>{formatNumber(entry.total_gas_fees)} fees</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {type === "combined" && entry.combined_score !== undefined && (
                  <div className="px-3 py-1.5 bg-red-100 rounded-full">
                    <span className="text-xs font-bold text-red-700">{(entry.combined_score * 100).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
          <Input
            placeholder="Search wallet address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10 border-red-200 focus:border-red-400 focus:ring-red-400"
          />
        </div>
        <Button onClick={handleSearch} className="bg-red-600 hover:bg-red-700 px-6">
          Search
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-red-50 p-1 h-auto gap-1">
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm py-2 px-2"
          >
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Transactions</span>
            <span className="sm:hidden">Txs</span>
          </TabsTrigger>
          <TabsTrigger
            value="balance"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm py-2 px-2"
          >
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Balance</span>
            <span className="sm:hidden">Bal</span>
          </TabsTrigger>
          <TabsTrigger
            value="volume"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm py-2 px-2"
          >
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Volume</span>
            <span className="sm:hidden">Vol</span>
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm py-2 px-2"
          >
            <Fuel className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Fees</span>
            <span className="sm:hidden">Fees</span>
          </TabsTrigger>
          <TabsTrigger
            value="combined"
            className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm py-2 px-2"
          >
            <Flame className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Combined</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Top Wallets by Transactions</CardTitle>
              <CardDescription className="text-red-700">
                Ranked by total transaction count • {leaderboardData.total} wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLeaderboard("transactions")}

              {/* Pagination */}
              {leaderboardData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-red-200">
                  <p className="text-sm text-red-600">
                    Page {currentPage} of {leaderboardData.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-red-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(leaderboardData.totalPages, p + 1))}
                      disabled={currentPage === leaderboardData.totalPages}
                      className="border-red-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Top Wallets by Balance</CardTitle>
              <CardDescription className="text-red-700">
                Ranked by spendable token balance • {leaderboardData.total} wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLeaderboard("balance")}

              {leaderboardData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-red-200">
                  <p className="text-sm text-red-600">
                    Page {currentPage} of {leaderboardData.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-red-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(leaderboardData.totalPages, p + 1))}
                      disabled={currentPage === leaderboardData.totalPages}
                      className="border-red-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="mt-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Top Wallets by Volume</CardTitle>
              <CardDescription className="text-red-700">
                Ranked by total transaction volume • {leaderboardData.total} wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLeaderboard("volume")}

              {leaderboardData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-red-200">
                  <p className="text-sm text-red-600">
                    Page {currentPage} of {leaderboardData.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-red-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(leaderboardData.totalPages, p + 1))}
                      disabled={currentPage === leaderboardData.totalPages}
                      className="border-red-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="mt-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Top Wallets by Gas Fees</CardTitle>
              <CardDescription className="text-red-700">
                Ranked by total gas fees paid • {leaderboardData.total} wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLeaderboard("fees")}

              {leaderboardData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-red-200">
                  <p className="text-sm text-red-600">
                    Page {currentPage} of {leaderboardData.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-red-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(leaderboardData.totalPages, p + 1))}
                      disabled={currentPage === leaderboardData.totalPages}
                      className="border-red-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combined" className="mt-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Combined Ranking</CardTitle>
              <CardDescription className="text-red-700">
                Ranked by combined score (25% each: transactions, balance, volume, fees) • {leaderboardData.total}{" "}
                wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLeaderboard("combined")}

              {leaderboardData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-red-200">
                  <p className="text-sm text-red-600">
                    Page {currentPage} of {leaderboardData.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-red-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(leaderboardData.totalPages, p + 1))}
                      disabled={currentPage === leaderboardData.totalPages}
                      className="border-red-200"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

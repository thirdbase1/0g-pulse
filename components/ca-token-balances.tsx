"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins } from "lucide-react"

interface TokenBalance {
  mint: string
  symbol: string
  name?: string
  balance: number
  decimals: number
  logoURI?: string | null
}

interface CATokenBalancesProps {
  topTokens: TokenBalance[]
  otherTokens: TokenBalance[]
  nativeBalance: number
  wFOGOBalance?: number
  totalPortfolioValue: number
}

export function CATokenBalances({
  topTokens,
  otherTokens,
  nativeBalance,
  wFOGOBalance = 0,
  totalPortfolioValue,
}: CATokenBalancesProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num)
  }

  const realBalance = nativeBalance + wFOGOBalance

  const totalTokensHeld =
    topTokens.filter((t) => t.balance > 0).length + otherTokens.filter((t) => t.balance > 0).length

  return (
    <Card className="border-red-900/20 bg-gradient-to-br from-black to-red-950/20">
      <CardHeader className="px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            <CardTitle className="text-base sm:text-lg text-red-500">
              {totalTokensHeld} Token{totalTokensHeld !== 1 ? "s" : ""} Held
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
          <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-red-900/30 bg-gradient-to-r from-red-950/30 to-orange-950/20">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600/20 flex items-center justify-center ring-2 ring-red-500/30 shrink-0">
                <span className="text-base sm:text-xl fire-glow">🔥</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-semibold text-red-400 truncate">Native FOGO</p>
                  <Badge variant="outline" className="text-xs border-red-700/50 text-red-500">
                    Core
                  </Badge>
                </div>
                <p className="text-xs text-gray-300">Gas & Transactions</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="text-xs sm:text-sm font-bold text-red-500">{formatNumber(nativeBalance)}</p>
              <p className="text-xs text-gray-400">FOGO</p>
            </div>
          </div>

          {wFOGOBalance > 0 && (
            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-red-900/30 bg-gradient-to-r from-red-950/30 to-orange-950/20">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600/20 flex items-center justify-center ring-2 ring-red-500/30 shrink-0">
                  <span className="text-base sm:text-xl">🌊</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-semibold text-red-400 truncate">Wrapped FOGO</p>
                    <Badge variant="outline" className="text-xs border-red-700/50 text-red-500">
                      Core
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-300">DeFi & Trading</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-xs sm:text-sm font-bold text-red-500">{formatNumber(wFOGOBalance)}</p>
                <p className="text-xs text-gray-400">wFOGO</p>
              </div>
            </div>
          )}

          {topTokens.filter((t) => t.balance > 0).length > 0 && (
            <div className="flex items-center gap-2 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
              <p className="text-xs text-gray-500 font-semibold">CA Tokens</p>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            </div>
          )}

          {topTokens
            .filter((t) => t.balance > 0)
            .map((token, idx) => (
              <div
                key={token.mint}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-orange-900/30 bg-gradient-to-r from-orange-950/20 to-red-950/10 hover:border-orange-700/50 transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ring-2 shrink-0 bg-orange-600/20 ring-orange-500/30 overflow-hidden">
                    {token.logoURI ? (
                      <img
                        src={token.logoURI || "/placeholder.svg"}
                        alt={token.symbol || "Token"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = "none"
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = "flex"
                        }}
                      />
                    ) : null}
                    <span
                      className="text-xs sm:text-sm font-bold text-orange-400"
                      style={{ display: token.logoURI ? "none" : "flex" }}
                    >
                      {(token.symbol || "??").slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm font-semibold truncate text-orange-400">
                        {token.name && token.name !== "Unknown Token" ? token.name : token.symbol || "Unknown"}
                      </p>
                      <Badge variant="outline" className="text-xs border-orange-700/50 text-orange-500">
                        Top CA
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 font-mono truncate">
                      {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-xs sm:text-sm font-bold text-orange-400">{formatNumber(token.balance)}</p>
                  <p className="text-xs text-gray-400">{token.symbol || "???"}</p>
                </div>
              </div>
            ))}

          {otherTokens
            .filter((t) => t.balance > 0)
            .slice(0, 10)
            .map((token) => (
              <div
                key={token.mint}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-800/50 bg-gray-950/30 hover:border-gray-700/50 transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ring-2 shrink-0 bg-gray-700/20 ring-gray-600/30 overflow-hidden">
                    {token.logoURI ? (
                      <img
                        src={token.logoURI || "/placeholder.svg"}
                        alt={token.symbol || "Token"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget
                          target.style.display = "none"
                          const fallback = target.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = "flex"
                        }}
                      />
                    ) : null}
                    <span
                      className="text-xs sm:text-sm font-bold text-gray-400"
                      style={{ display: token.logoURI ? "none" : "flex" }}
                    >
                      {(token.symbol || "??").slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold truncate text-gray-300">
                      {token.name && token.name !== "Unknown Token" && !token.name.includes("...")
                        ? token.name
                        : token.symbol || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500 font-mono truncate">
                      {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-xs sm:text-sm font-bold text-gray-300">{formatNumber(token.balance)}</p>
                  <p className="text-xs text-gray-400">{token.symbol || "???"}</p>
                </div>
              </div>
            ))}

          {totalTokensHeld === 0 && (
            <div className="text-center py-6 sm:py-8 text-gray-500">
              <p className="text-xs sm:text-sm">No CA tokens found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

import { type NextRequest, NextResponse } from "next/server"
import { TOP_CA_TOKEN_ADDRESSES } from "@/lib/constants"
import { fetchMultipleTokenMetadata } from "@/lib/token-fetcher"
import {
  fetchAllTransactions, // Use new merged function instead of fetchTransactionsWithFallback
  fetchRealTimeBalance,
  fetchCATokenBalances,
  fetchAllCATokenBalances,
  calculateActivityChart,
} from "@/lib/explorer-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    console.log("[v0] ========================================")
    console.log("[v0] Fetching complete wallet details for:", address)
    console.log("[v0] ========================================")

    const tokenMetadataMap = await fetchMultipleTokenMetadata(TOP_CA_TOKEN_ADDRESSES)

    const [nativeBalance, topCABalances, allCATokens, transactions] = await Promise.all([
      fetchRealTimeBalance(address),
      fetchCATokenBalances(address, TOP_CA_TOKEN_ADDRESSES),
      fetchAllCATokenBalances(address),
      fetchAllTransactions(address), // This ensures BOTH native + SPL complete
    ])

    console.log("[v0] ✓ All data fetched successfully")
    console.log("[v0] - Native balance:", nativeBalance, "0G")
    console.log("[v0] - Total transactions:", transactions.length)

    const formattedTopCABalances = TOP_CA_TOKEN_ADDRESSES.map((address) => {
      const metadata = tokenMetadataMap.get(address) || {
        symbol: `${address.slice(0, 4)}...${address.slice(-4)}`,
        name: "Unknown",
        decimals: 9,
        logoURI: null,
      }
      return {
        address,
        symbol: metadata.symbol,
        name: metadata.name,
        balance: topCABalances[address] || 0,
        decimals: metadata.decimals,
        isTopToken: true,
      }
    })

    const otherCATokens = allCATokens
      .filter((token) => !TOP_CA_TOKEN_ADDRESSES.includes(token.mint))
      .map((token) => ({
        address: token.mint,
        symbol: token.symbol || "UNKNOWN",
        name: token.name || "Unknown Token",
        balance: token.balance,
        decimals: token.decimals,
        isTopToken: false,
      }))

    const sentTxs = transactions.filter((tx) => tx.type === "send")
    const receivedTxs = transactions.filter((tx) => tx.type === "receive")

    const totalSent = sentTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0)
    const totalReceived = receivedTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0)
    const totalFees = transactions.reduce((sum, tx) => sum + (tx.fee || 0), 0)
    const totalVolume = totalSent + totalReceived

    const firstTx = transactions[transactions.length - 1]
    const lastTx = transactions[0]
    const firstTxDate = firstTx ? new Date(firstTx.timestamp) : new Date()
    const lastActiveDate = lastTx ? new Date(lastTx.timestamp) : new Date()
    const ageDays = Math.floor((Date.now() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24))

    const activityData = await calculateActivityChart(transactions)

    const topCAValue = formattedTopCABalances.reduce((sum, b) => sum + (b.balance || 0), 0)
    const otherCAValue = otherCATokens.reduce((sum, b) => sum + (b.balance || 0), 0)
    const totalCAValue = topCAValue + otherCAValue
    const totalPortfolioValue = nativeBalance + totalCAValue

    const netBalance = nativeBalance - totalFees

    const responseData = {
      wallet: {
        address,
        nativeBalance,
        totalPortfolioValue,
        totalCAValue,
        ageDays,
        firstTxDate: firstTxDate.toISOString(),
        lastActiveDate: lastActiveDate.toISOString(),
        walletBirthday: firstTxDate.toISOString().split("T")[0],
        stats: {
          totalSent,
          totalReceived,
          totalVolume,
          totalFees,
          netBalance,
          totalTransactions: transactions.length, // Now includes native + SPL transfers
          sentTransactions: sentTxs.length,
          receivedTransactions: receivedTxs.length,
        },
        activity: activityData,
      },
      balances: {
        native: {
          symbol: "0G",
          balance: nativeBalance,
          address: "So11111111111111111111111111111111111111112",
        },
        topCATokens: formattedTopCABalances,
        otherCATokens: otherCATokens,
        totalTokens: formattedTopCABalances.length + otherCATokens.length,
      },
      transactions: transactions, // Removed .slice(0, 100) to show ALL transactions
    }

    console.log("[v0] ========================================")
    console.log("[v0] Complete wallet details fetched successfully")
    console.log("[v0] - Total portfolio value:", totalPortfolioValue, "0G")
    console.log("[v0] - Total transactions (native + SPL):", transactions.length)
    console.log("[v0] - Total fees paid:", totalFees.toFixed(6), "0G")
    console.log("[v0] - Active days:", activityData.activeDays, "/ Inactive days:", activityData.inactiveDays)
    console.log("[v0] ========================================")

    return NextResponse.json({
      success: true,
      data: responseData,
      fetchedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] ✗ Error fetching complete wallet data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch complete wallet data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

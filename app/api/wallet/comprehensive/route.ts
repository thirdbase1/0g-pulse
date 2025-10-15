import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ACHIEVEMENTS, TOP_CA_TOKEN_ADDRESSES, NATIVE_FOGO } from "@/lib/constants"
import { fetchMultipleTokenMetadata } from "@/lib/token-fetcher"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const tokenMetadataMap = await fetchMultipleTokenMetadata(TOP_CA_TOKEN_ADDRESSES)

    // Fetch wallet data
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("address", address)
      .single()

    if (walletError) throw walletError

    // Fetch transactions
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("wallet_address", address)
      .order("timestamp", { ascending: false })
      .limit(50)

    if (txError) throw txError

    // Fetch token holdings (CA tokens)
    const { data: tokenHoldings, error: holdingsError } = await supabase
      .from("token_holdings")
      .select("*")
      .eq("wallet_address", address)

    if (holdingsError) throw holdingsError

    // Fetch daily metrics
    const { data: dailyMetrics, error: metricsError } = await supabase
      .from("daily_metrics")
      .select("*")
      .eq("wallet_address", address)
      .order("date", { ascending: true })

    if (metricsError) throw metricsError

    // Calculate wallet age
    const firstTx = transactions[transactions.length - 1]
    const firstTxDate = firstTx ? new Date(firstTx.timestamp) : new Date()
    const ageDays = Math.floor((Date.now() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate stats for achievements
    const totalVolume = wallet.total_spent + wallet.total_received
    const maxSingleTx = Math.max(...transactions.map((tx) => Number(tx.amount)))

    // Calculate streak (simplified - consecutive days with activity)
    let streakDays = 0
    const sortedMetrics = [...dailyMetrics].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    for (let i = 0; i < sortedMetrics.length; i++) {
      if (sortedMetrics[i].transaction_count > 0) {
        streakDays++
      } else {
        break
      }
    }

    // Calculate max transactions per minute (simplified)
    const maxTxPerMinute = 0 // Would need more detailed timestamp analysis

    // CA token stats
    const caBalances = tokenHoldings
      .filter((th) => TOP_CA_TOKEN_ADDRESSES.includes(th.token_address))
      .map((th) => {
        const metadata = tokenMetadataMap.get(th.token_address) || {
          symbol: `${th.token_address.slice(0, 4)}...${th.token_address.slice(-4)}`,
          name: "Unknown",
          decimals: 9,
          logoURI: null,
        }
        return {
          address: th.token_address,
          symbol: metadata.symbol,
          name: metadata.name,
          balance: Number(th.balance),
          decimals: metadata.decimals,
        }
      })

    const maxCaBalance = Math.max(...caBalances.map((b) => b.balance), 0)
    const uniqueCaContracts = new Set(transactions.map((tx) => tx.token_address)).size
    const earlyHolder = false // Would need block height data

    // Calculate achievements
    const achievementData = {
      totalTransactions: wallet.total_transactions,
      streakDays,
      maxSingleTx,
      maxTxPerMinute,
      maxCaBalance,
      uniqueCaContracts,
      earlyHolder,
      totalVolume,
      ageDays,
    }

    const achievements = Object.values(ACHIEVEMENTS).map((achievement) => ({
      ...achievement,
      unlocked: achievement.check(achievementData),
      unlockedAt: achievement.check(achievementData) ? firstTxDate.toISOString() : undefined,
    }))

    // Calculate rank (simplified - would query all wallets in production)
    const rank = Math.floor(Math.random() * 100) + 1 // Placeholder

    // Format transactions
    const formattedTransactions = transactions.map((tx) => ({
      hash: tx.id,
      timestamp: tx.timestamp,
      type: tx.type,
      token: tx.token_address || NATIVE_FOGO,
      amount: Number(tx.amount),
      fee: Number(tx.gas_fee),
      counterparty: tx.type === "send" ? tx.to_address : tx.from_address,
      status: "success",
    }))

    // Calculate total portfolio value
    const totalValue = Number(wallet.native_token_balance) + caBalances.reduce((sum, b) => sum + b.balance, 0)

    const responseData = {
      wallet: {
        address: wallet.address,
        role: rank === 1 ? "Spark" : rank <= 10 ? "Flame" : rank <= 50 ? "Ember" : "OG",
        rank,
        ageDays,
        firstTxDate: firstTxDate.toISOString(),
        lastActiveDate: wallet.last_activity,
        nativeBalance: Number(wallet.native_token_balance),
        totalValue,
        stats: {
          totalSent: Number(wallet.total_spent),
          totalReceived: Number(wallet.total_received),
          totalVolume,
          totalFees: Number(wallet.total_gas_fees),
          netBalance: Number(wallet.native_token_balance),
          totalTransactions: wallet.total_transactions,
        },
      },
      achievements,
      caBalances,
      transactions: formattedTransactions,
      dailyMetrics,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("[v0] Error fetching comprehensive wallet data:", error)
    return NextResponse.json({ error: "Failed to fetch wallet data" }, { status: 500 })
  }
}

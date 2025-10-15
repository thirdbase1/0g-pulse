import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const leaderboardCache: { [key: string]: { data: any; timestamp: number } } = {}
const CACHE_DURATION = 60000 // 60 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "transactions"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "500")
    const search = searchParams.get("search") || ""

    const offset = (page - 1) * limit

    const cacheKey = `leaderboard_${type}_${page}_${limit}_${search}`
    const now = Date.now()
    if (leaderboardCache[cacheKey] && now - leaderboardCache[cacheKey].timestamp < CACHE_DURATION) {
      return NextResponse.json({ success: true, ...leaderboardCache[cacheKey].data, cached: true })
    }

    const supabase = await createClient()

    let walletRank: number | null = null
    if (search) {
      // Get all wallets ordered by the leaderboard type to find the actual rank
      let rankQuery = supabase.from("wallets").select("address")

      switch (type) {
        case "transactions":
          rankQuery = rankQuery.order("total_transactions", { ascending: false })
          break
        case "balance":
          rankQuery = rankQuery.order("spendable_token_balance", { ascending: false })
          break
        case "volume":
          rankQuery = rankQuery.order("total_volume", { ascending: false })
          break
        case "fees":
          rankQuery = rankQuery.order("total_gas_fees", { ascending: false })
          break
        case "combined":
          // For combined, we'll calculate after fetching all data
          rankQuery = rankQuery.order("total_transactions", { ascending: false })
          break
        default:
          rankQuery = rankQuery.order("total_transactions", { ascending: false })
      }

      const { data: allWallets } = await rankQuery

      if (allWallets) {
        if (type === "combined") {
          // Calculate combined scores for all wallets
          const walletsWithScores = await calculateCombinedScores(supabase)
          const searchLower = search.toLowerCase()
          const foundIndex = walletsWithScores.findIndex((w) => w.address.toLowerCase().includes(searchLower))
          if (foundIndex !== -1) {
            walletRank = foundIndex + 1
          }
        } else {
          const searchLower = search.toLowerCase()
          const foundIndex = allWallets.findIndex((w) => w.address.toLowerCase().includes(searchLower))
          if (foundIndex !== -1) {
            walletRank = foundIndex + 1
          }
        }
      }
    }

    let countQuery = supabase.from("wallets").select("*", { count: "exact", head: true })
    let dataQuery = supabase.from("wallets").select("*")

    if (search) {
      countQuery = countQuery.ilike("address", `%${search}%`)
      dataQuery = dataQuery.ilike("address", `%${search}%`)
    }

    switch (type) {
      case "transactions":
        dataQuery = dataQuery.order("total_transactions", { ascending: false })
        break
      case "balance":
        dataQuery = dataQuery.order("spendable_token_balance", { ascending: false })
        break
      case "volume":
        dataQuery = dataQuery.order("total_volume", { ascending: false })
        break
      case "fees":
        dataQuery = dataQuery.order("total_gas_fees", { ascending: false })
        break
      case "combined":
        dataQuery = dataQuery.order("total_transactions", { ascending: false })
        break
      default:
        dataQuery = dataQuery.order("total_transactions", { ascending: false })
    }

    const { count } = await countQuery

    dataQuery = dataQuery.range(offset, offset + limit - 1)

    const { data, error } = await dataQuery

    if (error) throw error

    if (type === "combined" && data && data.length > 0) {
      const maxTransactions = Math.max(...data.map((w) => w.total_transactions || 0))
      const maxBalance = Math.max(...data.map((w) => w.spendable_token_balance || 0))
      const maxVolume = Math.max(...data.map((w) => w.total_volume || 0))
      const maxFees = Math.max(...data.map((w) => w.total_gas_fees || 0))

      const scored = data.map((wallet) => ({
        ...wallet,
        combined_score:
          (wallet.total_transactions / maxTransactions) * 0.25 +
          (wallet.spendable_token_balance / maxBalance) * 0.25 +
          (wallet.total_volume / maxVolume) * 0.25 +
          (wallet.total_gas_fees / maxFees) * 0.25,
      }))

      scored.sort((a, b) => b.combined_score - a.combined_score)

      const result = {
        data: scored,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        walletRank, // Include the actual rank in the response
      }

      leaderboardCache[cacheKey] = { data: result, timestamp: now }

      return NextResponse.json({ success: true, ...result })
    }

    const result = {
      data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      walletRank, // Include the actual rank in the response
    }

    leaderboardCache[cacheKey] = { data: result, timestamp: now }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

async function calculateCombinedScores(supabase: any) {
  const { data: allWallets } = await supabase.from("wallets").select("*")

  if (!allWallets || allWallets.length === 0) return []

  const maxTransactions = Math.max(...allWallets.map((w: any) => w.total_transactions || 0))
  const maxBalance = Math.max(...allWallets.map((w: any) => w.spendable_token_balance || 0))
  const maxVolume = Math.max(...allWallets.map((w: any) => w.total_volume || 0))
  const maxFees = Math.max(...allWallets.map((w: any) => w.total_gas_fees || 0))

  const scored = allWallets.map((wallet: any) => ({
    ...wallet,
    combined_score:
      (wallet.total_transactions / maxTransactions) * 0.25 +
      (wallet.spendable_token_balance / maxBalance) * 0.25 +
      (wallet.total_volume / maxVolume) * 0.25 +
      (wallet.total_gas_fees / maxFees) * 0.25,
  }))

  scored.sort((a: any, b: any) => b.combined_score - a.combined_score)

  return scored
}

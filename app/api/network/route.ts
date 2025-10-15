import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

let networkCache: { data: any; timestamp: number } | null = null
const CACHE_DURATION = 30000 // 30 seconds

export async function GET(request: NextRequest) {
  try {
    const now = Date.now()
    if (networkCache && now - networkCache.timestamp < CACHE_DURATION) {
      console.log("[v0] Returning cached network stats")
      return NextResponse.json({ success: true, ...networkCache.data, cached: true })
    }

    const supabase = await createClient()

    const { data: aggregateData, error: aggregateError } = await supabase
      .from("wallets")
      .select("total_transactions, total_volume, total_gas_fees, last_activity")

    if (aggregateError) {
      console.error("Error fetching aggregate data:", aggregateError)
      throw aggregateError
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const totalWallets = aggregateData?.length || 0
    const dailyActiveWallets =
      aggregateData?.filter((w) => w.last_activity && new Date(w.last_activity) >= yesterday).length || 0
    const totalVolume = aggregateData?.reduce((sum, wallet) => sum + (wallet.total_volume || 0), 0) || 0
    const totalTransactions = aggregateData?.reduce((sum, wallet) => sum + (wallet.total_transactions || 0), 0) || 0
    const totalFees = aggregateData?.reduce((sum, wallet) => sum + (wallet.total_gas_fees || 0), 0) || 0

    const responseData = {
      totalWallets,
      dailyActiveWallets,
      totalTransactionVolume: totalVolume,
      totalTransactions,
      totalFees,
    }

    networkCache = { data: { success: true, data: responseData }, timestamp: now }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("Error fetching network metrics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch network metrics",
        data: {
          totalWallets: 0,
          dailyActiveWallets: 0,
          totalTransactionVolume: 0,
          totalTransactions: 0,
          totalFees: 0,
        },
      },
      { status: 500 },
    )
  }
}

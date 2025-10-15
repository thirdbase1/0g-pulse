import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletData } = body

    if (!walletData) {
      return NextResponse.json({ error: "Wallet data is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Upsert wallet data
    const { error: walletError } = await supabase.from("wallets").upsert(
      {
        address: walletData.address,
        native_token_balance: walletData.nativeBalance,
        spendable_token_balance: walletData.realBalance,
        total_transactions: walletData.totalTxCount,
        total_spent: walletData.stats.totalSent,
        total_received: walletData.stats.totalReceived,
        total_volume: walletData.totalVolume,
        total_gas_fees: walletData.stats.totalFees,
        net_balance: walletData.realBalance - walletData.stats.totalFees,
        first_transaction_date: walletData.walletBirthday,
        wallet_age_days: walletData.walletAgeDays,
        last_activity: walletData.lastActive,
        rank_title: getRankTitle(walletData.totalVolume),
        active_days: Object.keys(walletData.dailyActivity).length,
        inactive_days: walletData.walletAgeDays - Object.keys(walletData.dailyActivity).length,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "address",
      },
    )

    if (walletError) {
      console.error("[v0] Error saving wallet:", walletError)
      throw walletError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error saving wallet data:", error)
    return NextResponse.json(
      {
        error: "Failed to save wallet data",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

function getRankTitle(volume: number): string {
  if (volume >= 500000) return "Wildfire"
  if (volume >= 100000) return "Blaze"
  if (volume >= 50000) return "OG"
  if (volume >= 10000) return "Ember"
  if (volume >= 1000) return "Flame"
  return "Spark"
}

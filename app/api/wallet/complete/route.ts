import { type NextRequest, NextResponse } from "next/server"
import { fetchComprehensiveWalletData } from "@/lib/wallet-fetcher"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    console.log(`[v0] Fetching complete data for wallet: ${address}`)
    const startTime = Date.now()

    const walletData = await fetchComprehensiveWalletData(address)

    const supabase = await createClient()

    // Upsert wallet data
    const { error: walletError } = await supabase.from("wallets").upsert(
      {
        address: address,
        spendable_token_balance: walletData.spendableBalance || 0,
        native_token_balance: walletData.nativeBalance || 0,
        total_transactions: walletData.totalTransactions || 0,
        total_spent: walletData.totalSpent || 0,
        total_received: walletData.totalReceived || 0,
        total_gas_fees: walletData.totalGasFees || 0,
        total_volume: walletData.totalVolume || 0,
        net_balance: walletData.netBalance || 0,
        first_transaction_date: walletData.walletBirthday || null,
        wallet_age_days: walletData.walletAgeDays || 0,
        active_days: walletData.activeDays || 0,
        inactive_days: walletData.inactiveDays || 0,
        last_activity: walletData.lastActivity || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "address",
      },
    )

    if (walletError) {
      console.error("[v0] Error saving wallet to database:", walletError)
    } else {
      console.log(`[v0] ✅ Wallet ${address} saved to database`)
    }

    const duration = Date.now() - startTime
    console.log(`[v0] Fetch completed in ${duration}ms`)

    return NextResponse.json({
      success: true,
      data: walletData,
      fetchTime: duration,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching wallet data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch wallet data",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("address")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    // Fetch wallet data from cache
    const { data: wallet } = await supabase.from("wallets").select("*").eq("address", walletAddress).single()

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found. Trigger background processing first." }, { status: 404 })
    }

    // Fetch token holdings with metadata
    const { data: holdings } = await supabase
      .from("token_holdings")
      .select(`
        *,
        token_metadata (*)
      `)
      .eq("wallet_address", walletAddress)

    // Fetch recent transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("wallet_address", walletAddress)
      .order("timestamp", { ascending: false })
      .limit(50)

    // Fetch daily metrics for chart
    const { data: dailyMetrics } = await supabase
      .from("daily_metrics")
      .select("*")
      .eq("wallet_address", walletAddress)
      .order("date", { ascending: true })
      .limit(30)

    return NextResponse.json({
      wallet,
      holdings: holdings || [],
      transactions: transactions || [],
      dailyMetrics: dailyMetrics || [],
      cached: true,
      lastUpdated: wallet.updated_at,
    })
  } catch (error) {
    console.error("[v0] Error fetching cached wallet data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch wallet overview
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("address", address)
      .single()

    if (walletError) throw walletError

    // Fetch daily metrics (last 30 days)
    const { data: dailyMetrics, error: metricsError } = await supabase
      .from("daily_metrics")
      .select("*")
      .eq("wallet_address", address)
      .order("date", { ascending: true })

    if (metricsError) throw metricsError

    // Fetch token holdings
    const { data: tokenHoldings, error: holdingsError } = await supabase
      .from("token_holdings")
      .select("*")
      .eq("wallet_address", address)
      .order("balance", { ascending: false })
      .limit(4)

    if (holdingsError) throw holdingsError

    // Fetch contract interactions
    const { data: contractInteractions, error: contractsError } = await supabase
      .from("contract_interactions")
      .select("*")
      .eq("wallet_address", address)
      .order("interaction_count", { ascending: false })

    if (contractsError) throw contractsError

    // Fetch frequent recipients (more than 10 sends)
    const { data: frequentRecipients, error: recipientsError } = await supabase
      .from("frequent_recipients")
      .select("*")
      .eq("wallet_address", address)
      .gte("send_count", 10)
      .order("send_count", { ascending: false })

    if (recipientsError) throw recipientsError

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        dailyMetrics,
        tokenHoldings,
        contractInteractions: {
          total: contractInteractions.length,
          interactions: contractInteractions,
        },
        frequentRecipients,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching wallet analytics:", error)
    return NextResponse.json({ error: "Failed to fetch wallet analytics" }, { status: 500 })
  }
}

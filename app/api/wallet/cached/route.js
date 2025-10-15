// app/api/wallet/cached/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  fetchWalletBalance,
  fetchWalletTransactions,
  fetchTokenHoldings,
  isValidFogoAddress,
} from "@/lib/fogo-rpc"
import { SPENDABLE_TOKEN_ADDRESS, DAYS_TO_TRACK } from "@/lib/constants"

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    // Validate wallet address
    if (!address || !isValidFogoAddress(address)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 })
    }

    console.log("[v0] Processing wallet:", address)
    const supabase = await createClient()

    // Fetch wallet data concurrently
    const [balance, transactions, tokenHoldings] = await Promise.all([
      fetchWalletBalance(address),
      fetchWalletTransactions(address),
      fetchTokenHoldings(address),
    ])

    console.log("[v0] Fetched", transactions.length, "total transactions")

    // Calculate metrics
    const totalSpent = transactions
      .filter((tx) => tx.type === "sent" && tx.tokenAddress === SPENDABLE_TOKEN_ADDRESS)
      .reduce((sum, tx) => sum + tx.amount, 0)

    const totalReceived = transactions
      .filter((tx) => tx.type === "received" && tx.tokenAddress === SPENDABLE_TOKEN_ADDRESS)
      .reduce((sum, tx) => sum + tx.amount, 0)

    const totalGasFees = transactions.reduce((sum, tx) => sum + tx.gasFee, 0)

    const lastActivity = transactions.length > 0 ? transactions[0].timestamp : new Date()

    // Upsert wallet data
    const { error: walletError } = await supabase.from("wallets").upsert({
      address,
      spendable_token_balance: balance.spendableTokenBalance,
      native_token_balance: balance.nativeTokenBalance,
      total_transactions: transactions.length,
      total_spent: totalSpent,
      total_received: totalReceived,
      total_gas_fees: totalGasFees,
      last_activity: lastActivity.toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (walletError) throw walletError

    // Store transactions
    if (transactions.length > 0) {
      const txRecords = transactions.map((tx) => ({
        id: tx.id,
        wallet_address: address,
        type: tx.type,
        amount: tx.amount,
        token_address: tx.tokenAddress,
        gas_fee: tx.gasFee,
        to_address: tx.toAddress,
        from_address: tx.fromAddress,
        timestamp: tx.timestamp.toISOString(),
      }))
      await supabase.from("transactions").upsert(txRecords)
    }

    // Store daily metrics
    const dailyMetrics = calculateDailyMetrics(transactions, address)
    if (dailyMetrics.length > 0) {
      await supabase.from("daily_metrics").upsert(dailyMetrics)
    }

    // Store token holdings
    if (tokenHoldings.length > 0) {
      const holdingRecords = tokenHoldings.map((holding) => ({
        wallet_address: address,
        token_address: holding.tokenAddress,
        balance: holding.balance,
        updated_at: new Date().toISOString(),
      }))
      await supabase.from("token_holdings").upsert(holdingRecords)
    }

    // Store contract interactions
    const contractInteractions = calculateContractInteractions(transactions, address)
    if (contractInteractions.length > 0) {
      await supabase.from("contract_interactions").upsert(contractInteractions)
    }

    // Store frequent recipients
    const frequentRecipients = calculateFrequentRecipients(transactions, address)
    if (frequentRecipients.length > 0) {
      await supabase.from("frequent_recipients").upsert(frequentRecipients)
    }

    return NextResponse.json({
      success: true,
      data: {
        address,
        balance,
        totalTransactions: transactions.length,
        totalSpent,
        totalReceived,
        totalGasFees,
        lastActivity,
      },
    })
  } catch (error) {
    console.error("[v0] Error processing wallet:", error)
    return NextResponse.json(
      { error: "Failed to process wallet data" },
      { status: 500 }
    )
  }
}

// --- Helper functions ---

function calculateDailyMetrics(transactions: any[], walletAddress: string) {
  const metrics = new Map<string, any>()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_TRACK)

  for (const tx of transactions) {
    const date = new Date(tx.timestamp).toISOString().split("T")[0]
    const txDate = new Date(tx.timestamp)

    if (txDate < cutoffDate) continue

    if (!metrics.has(date)) {
      metrics.set(date, {
        wallet_address: walletAddress,
        date,
        total_spent: 0,
        total_received: 0,
        transaction_count: 0,
        gas_fees: 0,
      })
    }

    const metric = metrics.get(date)
    metric.transaction_count++
    metric.gas_fees += tx.gasFee

    if (tx.type === "sent" && tx.tokenAddress === SPENDABLE_TOKEN_ADDRESS) {
      metric.total_spent += tx.amount
    } else if (tx.type === "received" && tx.tokenAddress === SPENDABLE_TOKEN_ADDRESS) {
      metric.total_received += tx.amount
    }
  }

  return Array.from(metrics.values())
}

function calculateContractInteractions(transactions: any[], walletAddress: string) {
  const interactions = new Map<string, any>()

  for (const tx of transactions) {
    const contractAddress = tx.contractAddress || tx.toAddress

    if (contractAddress && contractAddress !== walletAddress) {
      if (!interactions.has(contractAddress)) {
        interactions.set(contractAddress, {
          wallet_address: walletAddress,
          contract_address: contractAddress,
          interaction_count: 0,
          last_interaction: tx.timestamp.toISOString(),
        })
      }

      const interaction = interactions.get(contractAddress)
      interaction.interaction_count++
      interaction.last_interaction = tx.timestamp.toISOString()
    }
  }

  return Array.from(interactions.values())
}

function calculateFrequentRecipients(transactions: any[], walletAddress: string) {
  const recipients = new Map<string, any>()

  for (const tx of transactions) {
    if (tx.type === "sent" && tx.toAddress) {
      const recipientAddress = tx.toAddress

      if (!recipients.has(recipientAddress)) {
        recipients.set(recipientAddress, {
          wallet_address: walletAddress,
          recipient_address: recipientAddress,
          send_count: 0,
          total_amount_sent: 0,
        })
      }

      const recipient = recipients.get(recipientAddress)
      recipient.send_count++
      recipient.total_amount_sent += tx.amount
    }
  }

  return Array.from(recipients.values())
}

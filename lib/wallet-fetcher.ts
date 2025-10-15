import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { getAssociatedTokenAddress, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { RPC_URL, NATIVE_FOGO, TOP_CA_TOKEN_ADDRESSES } from "./constants"
import { fetchMultipleTokenMetadata } from "./token-fetcher"
import { fetchAllTransactionsFromExplorer, fetchAllTransfersFromExplorer } from "./explorer-api"

const connection = new Connection(RPC_URL, "confirmed")

export interface WalletData {
  address: string
  totalTxCount: number
  walletBirthday: string | null
  walletAgeDays: number
  lastActive: string | null
  realBalance: number
  nativeBalance: number
  wFOGOBalance: number
  totalVolume: number
  stats: {
    totalSent: number
    totalReceived: number
    totalFees: number
    transactionFees: number
    transferFees: number
  }
  topCABalances: Array<{
    mint: string
    symbol: string
    name: string
    balance: number
    decimals: number
    logoURI: string | null
  }>
  otherTokens: Array<{
    mint: string
    symbol: string
    name: string
    balance: number
    decimals: number
    logoURI: string | null
  }>
  transactions: Array<{
    signature: string
    timestamp: number
    type: string
    value: number
    fee: number
    from: string
    to: string
    status: string
    transfers: Array<{
      mint: string
      from: string
      to: string
      amount: number
    }>
  }>
  dailyActivity: Record<
    string,
    {
      txCount: number
      volume: number
      sent: number
      received: number
    }
  >
  achievements: string[]
}

export async function fetchComprehensiveWalletData(walletAddress: string): Promise<WalletData> {
  console.log(`[v0] 🔥 Starting COMPLETE wallet data fetch for: ${walletAddress}`)
  const startTime = Date.now()
  const pubkey = new PublicKey(walletAddress)
  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysAgo = now - 30 * 86400

  console.log("[v0] 📡 Fetching ALL transactions and transfers from FogoScan explorer...")
  const [explorerTransactions, explorerTransfers, nativeBalance, wFOGOBalance, tokenAccounts] = await Promise.all([
    fetchAllTransactionsFromExplorer(walletAddress),
    fetchAllTransfersFromExplorer(walletAddress),
    connection.getBalance(pubkey).then((bal) => bal / LAMPORTS_PER_SOL),
    fetchWFOGOBalance(pubkey),
    connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID }),
  ])

  const totalTxCount = explorerTransactions.length + explorerTransfers.length
  console.log(
    `[v0] 🎉 COMPLETE! Fetched ${explorerTransactions.length} transactions + ${explorerTransfers.length} transfers = ${totalTxCount} total`,
  )

  const realBalance = nativeBalance + wFOGOBalance
  console.log(`[v0] 💰 Balances - Native: ${nativeBalance}, wFOGO: ${wFOGOBalance}, Real: ${realBalance}`)

  const allMints = tokenAccounts.value.map((acc) => acc.account.data.parsed.info.mint)
  const mintsToFetch = allMints.slice(0, 50)
  console.log(
    `[v0] 🏷️ Fetching metadata for ${mintsToFetch.length} tokens (limited from ${allMints.length} for performance)...`,
  )
  const tokenMetadataMap = await fetchMultipleTokenMetadata(mintsToFetch)

  const topCABalances = await Promise.all(
    TOP_CA_TOKEN_ADDRESSES.map(async (address) => {
      const account = tokenAccounts.value.find((acc) => acc.account.data.parsed.info.mint === address)
      const metadata = tokenMetadataMap.get(address) || {
        symbol: `${address.slice(0, 4)}...${address.slice(-4)}`,
        name: `${address.slice(0, 4)}...${address.slice(-4)}`,
        logoURI: null,
        decimals: 9,
      }
      return {
        mint: address,
        symbol: metadata.symbol,
        name: metadata.name,
        balance: account ? Number(account.account.data.parsed.info.tokenAmount.uiAmount) : 0,
        decimals: account?.account.data.parsed.info.tokenAmount.decimals || metadata.decimals,
        logoURI: metadata.logoURI,
      }
    }),
  )

  const otherTokens = tokenAccounts.value
    .filter((acc) => !TOP_CA_TOKEN_ADDRESSES.includes(acc.account.data.parsed.info.mint))
    .map((acc) => {
      const mint = acc.account.data.parsed.info.mint
      const metadata = tokenMetadataMap.get(mint) || {
        symbol: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
        name: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
        logoURI: null,
        decimals: 9,
      }
      return {
        mint,
        symbol: metadata.symbol,
        name: metadata.name,
        balance: Number(acc.account.data.parsed.info.tokenAmount.uiAmount),
        decimals: acc.account.data.parsed.info.tokenAmount.decimals,
        logoURI: metadata.logoURI,
      }
    })

  console.log(`[v0] 📊 Token balances - Top CA: ${topCABalances.length}, Other: ${otherTokens.length}`)

  const transactions = explorerTransactions.map((tx) => ({
    signature: tx.hash,
    timestamp: tx.blockTime,
    type: tx.type,
    value: tx.amount,
    fee: tx.fee,
    from: tx.type === "send" ? walletAddress : tx.counterparty,
    to: tx.type === "send" ? tx.counterparty : walletAddress,
    status: tx.status === "success" ? "Success" : "Failed",
    transfers: tx.transfers || [],
  }))

  transactions.sort((a, b) => b.timestamp - a.timestamp)

  const oldestTx = explorerTransactions[explorerTransactions.length - 1]
  const newestTx = explorerTransactions[0]

  const oldestTransfer = explorerTransfers[explorerTransfers.length - 1]

  let walletBirthday: string | null = null
  let oldestTimestamp = 0

  if (oldestTx && oldestTransfer) {
    oldestTimestamp = Math.min(oldestTx.blockTime, oldestTransfer.blockTime)
  } else if (oldestTx) {
    oldestTimestamp = oldestTx.blockTime
  } else if (oldestTransfer) {
    oldestTimestamp = oldestTransfer.blockTime
  }

  if (oldestTimestamp > 0) {
    walletBirthday = new Date(oldestTimestamp * 1000).toISOString().split("T")[0]
  }

  let newestTimestamp = 0
  if (newestTx && explorerTransfers[0]) {
    newestTimestamp = Math.max(newestTx.blockTime, explorerTransfers[0].blockTime)
  } else if (newestTx) {
    newestTimestamp = newestTx.blockTime
  } else if (explorerTransfers[0]) {
    newestTimestamp = explorerTransfers[0].blockTime
  }

  const walletAgeDays =
    oldestTimestamp && newestTimestamp ? Math.max(1, Math.ceil((newestTimestamp - oldestTimestamp) / 86400)) : 0

  console.log(`[v0] 🎂 Wallet birthday: ${walletBirthday} (${walletAgeDays} days old)`)

  const lastActive = explorerTransactions[0] ? new Date(explorerTransactions[0].blockTime * 1000).toISOString() : null

  const recentTransactions = explorerTransactions.filter((tx) => tx.blockTime >= thirtyDaysAgo)
  const recentTransfers = explorerTransfers.filter((tx) => tx.blockTime >= thirtyDaysAgo)

  console.log(
    `[v0] 📈 Filtered to ${recentTransactions.length} transactions + ${recentTransfers.length} transfers from last 30 days`,
  )

  const { totalSent, totalReceived, totalVolume, totalFees, transactionFees, transferFees, dailyActivity } =
    calculateVolumeAndActivity(recentTransactions, recentTransfers, walletAddress)

  console.log(`[v0] 💸 Volume - Sent: ${totalSent}, Received: ${totalReceived}, Total: ${totalVolume}`)
  console.log(`[v0] 📅 Daily activity tracked for ${Object.keys(dailyActivity).length} days`)

  const achievements = computeAchievements({
    totalTransactions: totalTxCount,
    streakDays: calculateStreak(dailyActivity),
    maxSingleTx: Math.max(...transactions.map((tx) => tx.value || 0)),
    maxTxPerMinute: calculateMaxTxPerMinute(transactions),
    maxCaBalance: Math.max(...topCABalances.map((t) => t.balance)),
    uniqueCaContracts: topCABalances.filter((t) => t.balance > 0).length,
    earlyHolder: walletAgeDays > 30,
    totalVolume,
    ageDays: walletAgeDays,
  })

  const elapsed = Date.now() - startTime
  console.log(`[v0] ✨ Fetch completed in ${elapsed}ms (${(elapsed / 1000).toFixed(2)}s)`)

  return {
    address: walletAddress,
    totalTxCount,
    walletBirthday,
    walletAgeDays,
    lastActive,
    realBalance,
    nativeBalance,
    wFOGOBalance,
    totalVolume,
    stats: { totalSent, totalReceived, totalFees, transactionFees, transferFees },
    topCABalances,
    otherTokens,
    transactions,
    dailyActivity,
    achievements,
  }
}

async function fetchWFOGOBalance(pubkey: PublicKey): Promise<number> {
  try {
    const wFOGO_ATA = await getAssociatedTokenAddress(new PublicKey(NATIVE_FOGO), pubkey)
    const acc = await getAccount(connection, wFOGO_ATA)
    return Number(acc.amount) / Math.pow(10, 9)
  } catch (e) {
    return 0
  }
}

function calculateStreak(dailyActivity: Record<string, any>): number {
  const dates = Object.keys(dailyActivity).sort()
  let streak = 0
  let currentStreak = 0

  for (let i = 0; i < dates.length; i++) {
    if (i === 0 || isConsecutiveDay(dates[i - 1], dates[i])) {
      currentStreak++
      streak = Math.max(streak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return streak
}

function isConsecutiveDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)
  return diff === 1
}

function calculateMaxTxPerMinute(transactions: any[]): number {
  const minuteBuckets: Record<string, number> = {}
  transactions.forEach((tx) => {
    const minute = Math.floor(tx.timestamp / 60)
    minuteBuckets[minute] = (minuteBuckets[minute] || 0) + 1
  })
  return Math.max(...Object.values(minuteBuckets), 0)
}

function computeAchievements(data: any): string[] {
  const achievements: string[] = []

  if (data.totalTransactions > 0) achievements.push("First Fire")
  if (data.streakDays >= 7) achievements.push("Consistent Burner")
  if (data.maxSingleTx >= 10000) achievements.push("Big Burner")
  if (data.maxTxPerMinute >= 5) achievements.push("Fast Hands")
  if (data.maxCaBalance >= 10000) achievements.push("CA Whale")
  if (data.uniqueCaContracts >= 3) achievements.push("Multi-token Burner")
  if (data.totalVolume >= 100000) achievements.push("Volcano Rank")
  if (data.ageDays >= 365) achievements.push("Cosmic Flame")
  if (data.ageDays <= 7) achievements.push("New Spark")

  return achievements
}

function calculateVolumeAndActivity(
  transactions: any[],
  transfers: any[],
  walletAddress: string,
): {
  totalSent: number
  totalReceived: number
  totalVolume: number
  totalFees: number
  transactionFees: number
  transferFees: number
  dailyActivity: Record<string, { txCount: number; volume: number; sent: number; received: number }>
} {
  let totalSent = 0
  let totalReceived = 0
  let transactionFees = 0
  let transferFees = 0
  const dailyActivity: Record<string, { txCount: number; volume: number; sent: number; received: number }> = {}

  console.log("[v0] 🔍 Calculating volume for wFOGO only (So11111111111111111111111111111111111111112)")

  const allActivity = [
    ...transactions.map((tx) => ({ ...tx, source: "transaction" })),
    ...transfers.map((tx) => ({ ...tx, source: "transfer" })),
  ]

  console.log(
    `[v0] 📊 Processing ${transactions.length} transactions + ${transfers.length} transfers = ${allActivity.length} total`,
  )

  let wFOGOCount = 0
  let otherTokenCount = 0

  const SPL_TRANSFER_FEE = 0.000015 // Default fee for SPL transfers in FOGO

  for (const item of allActivity) {
    const itemFee = item.fee || 0
    if (item.source === "transaction") {
      transactionFees += itemFee
    } else {
      // For SPL transfers, use the default fee if no fee is provided
      const transferFee = itemFee > 0 ? itemFee : SPL_TRANSFER_FEE
      transferFees += transferFee
    }

    if (item.token !== NATIVE_FOGO) {
      otherTokenCount++
      continue
    }

    wFOGOCount++

    const date = new Date(item.blockTime * 1000).toISOString().split("T")[0]

    if (!dailyActivity[date]) {
      dailyActivity[date] = { txCount: 0, volume: 0, sent: 0, received: 0 }
    }

    dailyActivity[date].txCount += 1

    const normalizedAmount = item.amount / 1e9

    if (item.type === "send") {
      totalSent += normalizedAmount
      dailyActivity[date].sent += normalizedAmount
      dailyActivity[date].volume += normalizedAmount
    } else if (item.type === "receive") {
      totalReceived += normalizedAmount
      dailyActivity[date].received += normalizedAmount
      dailyActivity[date].volume += normalizedAmount
    }
  }

  const totalFees = transactionFees + transferFees
  const totalVolume = totalSent + totalReceived

  console.log(`[v0] 🎯 Filtered: ${wFOGOCount} wFOGO items, ${otherTokenCount} other tokens`)
  console.log(
    `[v0] 💰 wFOGO Volume - Sent: ${totalSent.toFixed(2)}, Received: ${totalReceived.toFixed(2)}, Total: ${totalVolume.toFixed(2)}`,
  )
  console.log(
    `[v0] 💸 Total Gas Fees: ${totalFees.toFixed(6)} FOGO (Transactions: ${transactionFees.toFixed(6)}, Transfers: ${transferFees.toFixed(6)} [${transfers.length} × ${SPL_TRANSFER_FEE}])`,
  )

  return { totalSent, totalReceived, totalVolume, totalFees, transactionFees, transferFees, dailyActivity }
}

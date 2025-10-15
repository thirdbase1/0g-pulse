import { RPC_URL, SPENDABLE_TOKEN_ADDRESS, TOP_TOKEN_ADDRESSES } from "./constants"

export interface Transaction {
  id: string
  type: "sent" | "received"
  amount: number
  tokenAddress: string
  gasFee: number
  toAddress: string
  fromAddress: string
  timestamp: Date
  contractAddress?: string
}

export interface WalletBalance {
  address: string
  spendableTokenBalance: number
  nativeTokenBalance: number
}

export interface TokenHolding {
  tokenAddress: string
  balance: number
}

export function isValidFogoAddress(address: string): boolean {
  // Solana addresses are base58 encoded and typically 32-44 characters
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

export async function fetchWalletBalance(address: string): Promise<WalletBalance> {
  try {
    // Fetch native token (Fogo) balance
    const nativeResponse = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    })

    const nativeData = await nativeResponse.json()

    if (nativeData.error) {
      throw new Error(nativeData.error.message)
    }

    // Fetch SPL token accounts for spendable token
    const tokenResponse = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "getTokenAccountsByOwner",
        params: [
          address,
          {
            mint: SPENDABLE_TOKEN_ADDRESS,
          },
          {
            encoding: "jsonParsed",
          },
        ],
      }),
    })

    const tokenData = await tokenResponse.json()

    let spendableBalance = 0
    if (tokenData.result?.value?.length > 0) {
      const tokenAccount = tokenData.result.value[0]
      spendableBalance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount || 0
    }

    return {
      address,
      nativeTokenBalance: (nativeData.result?.value || 0) / 1e9, // Convert lamports to tokens
      spendableTokenBalance: spendableBalance,
    }
  } catch (error) {
    console.error("[v0] Error fetching wallet balance:", error)
    throw error
  }
}

export async function fetchWalletTransactions(address: string, limit = 1000): Promise<Transaction[]> {
  try {
    console.log("[v0] Starting transaction fetch for:", address)

    const allSignatures: any[] = []
    let lastSignature: string | undefined = undefined

    // Keep fetching until we get less than 1000 or hit our total limit
    while (true) {
      const params: any[] = [address, { limit: 1000 }]
      if (lastSignature) {
        params[1].before = lastSignature
      }

      const response = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getSignaturesForAddress",
          params,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      const signatures = data.result || []
      console.log("[v0] Fetched batch of", signatures.length, "signatures")

      if (signatures.length === 0) break

      allSignatures.push(...signatures)

      // If we got less than 1000, we've reached the end
      if (signatures.length < 1000) break

      // Set the last signature for pagination
      lastSignature = signatures[signatures.length - 1].signature
    }

    console.log("[v0] Total signatures fetched:", allSignatures.length)
    const transactions: Transaction[] = []

    const batchSize = 50
    for (let i = 0; i < allSignatures.length; i += batchSize) {
      const batch = allSignatures.slice(i, i + batchSize)
      console.log(
        "[v0] Processing batch",
        Math.floor(i / batchSize) + 1,
        "of",
        Math.ceil(allSignatures.length / batchSize),
      )

      const batchPromises = batch.map(async (sig: any) => {
        try {
          const txResponse = await fetch(RPC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "getTransaction",
              params: [
                sig.signature,
                {
                  encoding: "jsonParsed",
                  maxSupportedTransactionVersion: 0,
                },
              ],
            }),
          })

          const txData = await txResponse.json()

          if (txData.result) {
            const tx = parseTransaction(txData.result, address)
            return tx
          }
        } catch (error) {
          console.error("[v0] Error fetching transaction:", error)
          return null
        }
        return null
      })

      const batchResults = await Promise.all(batchPromises)
      transactions.push(...batchResults.filter((tx): tx is Transaction => tx !== null))
    }

    console.log("[v0] Total transactions processed:", transactions.length)
    return transactions
  } catch (error) {
    console.error("[v0] Error fetching wallet transactions:", error)
    throw error
  }
}

function parseTransaction(txData: any, walletAddress: string): Transaction | null {
  try {
    const meta = txData.meta
    const transaction = txData.transaction

    if (!meta || !transaction) return null

    const accountKeys = transaction.message.accountKeys.map((key: any) => (typeof key === "string" ? key : key.pubkey))

    const instructions = transaction.message.instructions

    // Determine transaction type based on balance changes
    const walletIndex = accountKeys.findIndex((key: string) => key === walletAddress)
    if (walletIndex === -1) return null

    const preBalance = meta.preBalances[walletIndex]
    const postBalance = meta.postBalances[walletIndex]
    const balanceChange = postBalance - preBalance
    const gasFee = meta.fee / 1e9 // Convert lamports to tokens

    // Determine type and addresses
    const type = balanceChange < 0 ? "sent" : "received"
    const fromAddress = accountKeys[0]
    let toAddress = ""
    let contractAddress = ""

    // Try to find recipient from instructions
    if (instructions.length > 0) {
      const firstInstruction = instructions[0]
      if (firstInstruction.parsed?.info) {
        toAddress = firstInstruction.parsed.info.destination || firstInstruction.parsed.info.authority || ""
      } else if (firstInstruction.accounts?.length > 1) {
        toAddress = accountKeys[firstInstruction.accounts[1]] || ""
      }

      // Check if this is a program/contract interaction
      const programId = firstInstruction.programId || accountKeys[firstInstruction.programIdIndex]
      if (programId && programId !== "11111111111111111111111111111111") {
        contractAddress = programId
      }
    }

    // Parse token transfers from inner instructions
    let tokenAmount = Math.abs(balanceChange) / 1e9
    const tokenAddress = SPENDABLE_TOKEN_ADDRESS

    if (meta.innerInstructions) {
      for (const inner of meta.innerInstructions) {
        for (const instruction of inner.instructions) {
          if (instruction.parsed?.type === "transfer" || instruction.parsed?.type === "transferChecked") {
            const info = instruction.parsed.info
            if (info.mint === SPENDABLE_TOKEN_ADDRESS) {
              tokenAmount = info.tokenAmount?.uiAmount || info.amount / 1e9
              break
            }
          }
        }
      }
    }

    return {
      id: transaction.signatures[0],
      type,
      amount: tokenAmount,
      tokenAddress,
      gasFee,
      toAddress: toAddress || accountKeys[1] || "",
      fromAddress,
      timestamp: new Date(txData.blockTime * 1000),
      contractAddress: contractAddress || undefined,
    }
  } catch (error) {
    console.error("[v0] Error parsing transaction:", error)
    return null
  }
}

export async function fetchTokenHoldings(address: string): Promise<TokenHolding[]> {
  try {
    const holdings: TokenHolding[] = []

    for (const tokenAddress of TOP_TOKEN_ADDRESSES) {
      const response = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTokenAccountsByOwner",
          params: [
            address,
            {
              mint: tokenAddress,
            },
            {
              encoding: "jsonParsed",
            },
          ],
        }),
      })

      const data = await response.json()

      if (data.result?.value?.length > 0) {
        const tokenAccount = data.result.value[0]
        const balance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount || 0

        holdings.push({
          tokenAddress,
          balance,
        })
      } else {
        holdings.push({
          tokenAddress,
          balance: 0,
        })
      }
    }

    return holdings
  } catch (error) {
    console.error("[v0] Error fetching token holdings:", error)
    throw error
  }
}

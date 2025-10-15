import { Connection, PublicKey } from "@solana/web3.js"
import { RPC_URL } from "./constants"

const connection = new Connection(RPC_URL, "confirmed")

const metadataCache = new Map<string, TokenMetadata>()

export interface TokenMetadata {
  symbol: string
  name: string
  logoURI: string | null
  decimals: number
}

export async function fetchTokenMetadata(mint: string): Promise<TokenMetadata> {
  // Check cache first
  if (metadataCache.has(mint)) {
    return metadataCache.get(mint)!
  }

  try {
    console.log(`[v0] Fetching metadata for token: ${mint}`)
    const mintPubkey = new PublicKey(mint)
    const mintInfo = await connection.getParsedAccountInfo(mintPubkey)
    const data = mintInfo.value?.data

    if (!data || !("parsed" in data)) {
      const fallback = {
        symbol: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
        name: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
        logoURI: null,
        decimals: 9,
      }
      metadataCache.set(mint, fallback)
      return fallback
    }

    const parsed = data.parsed?.info || {}
    const metadata = {
      symbol: parsed.symbol || `${mint.slice(0, 4)}...${mint.slice(-4)}`,
      name: parsed.name || `${mint.slice(0, 4)}...${mint.slice(-4)}`,
      logoURI: parsed.logoURI || null,
      decimals: parsed.decimals || 9,
    }

    metadataCache.set(mint, metadata)
    console.log(`[v0] Fetched metadata for ${mint}: ${metadata.symbol} (${metadata.name})`)
    return metadata
  } catch (e) {
    console.error(`[v0] Error fetching token metadata for ${mint}:`, e)
    const fallback = {
      symbol: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
      name: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
      logoURI: null,
      decimals: 9,
    }
    metadataCache.set(mint, fallback)
    return fallback
  }
}

export async function fetchMultipleTokenMetadata(mints: string[]): Promise<Map<string, TokenMetadata>> {
  console.log(`[v0] Batch fetching metadata for ${mints.length} tokens...`)
  const metadataMap = new Map<string, TokenMetadata>()

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < mints.length; i += batchSize) {
    const batch = mints.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(async (mint) => {
        const metadata = await fetchTokenMetadata(mint)
        return { mint, metadata }
      }),
    )

    results.forEach(({ mint, metadata }) => {
      metadataMap.set(mint, metadata)
    })

    // Small delay between batches to avoid rate limits
    if (i + batchSize < mints.length) {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  console.log(`[v0] Completed batch fetch for ${mints.length} tokens`)
  return metadataMap
}

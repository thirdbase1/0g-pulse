import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { publicKey } from "@metaplex-foundation/umi"
import { fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata"
import { RPC_URL, NATIVE_FOGO } from "./constants"
import { createClient } from "@supabase/supabase-js"

const IPFS_GATEWAY = "https://ipfs.io/ipfs/"
const ARWEAVE_GATEWAY = "https://arweave.net/"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// In-memory cache for quick lookups
const memoryCache = new Map<string, TokenMetadata>()

export interface TokenMetadata {
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI?: string
}

function normalizeUri(uri: string): string {
  const trimmed = uri.replace(/\0/g, "").trim()

  if (trimmed.startsWith("ipfs://")) {
    return trimmed.replace("ipfs://", IPFS_GATEWAY)
  }

  if (trimmed.startsWith("ar://")) {
    return trimmed.replace("ar://", ARWEAVE_GATEWAY)
  }

  return trimmed
}

async function getFromCache(mintAddress: string): Promise<TokenMetadata | null> {
  // Check memory cache first
  if (memoryCache.has(mintAddress)) {
    return memoryCache.get(mintAddress)!
  }

  // Check database cache
  try {
    const { data, error } = await supabase.from("token_metadata").select("*").eq("mint_address", mintAddress).single()

    if (!error && data) {
      const metadata: TokenMetadata = {
        address: mintAddress,
        name: data.name,
        symbol: data.symbol,
        decimals: data.decimals || 9,
        logoURI: data.logo_uri || undefined,
      }
      memoryCache.set(mintAddress, metadata)
      return metadata
    }
  } catch (error) {
    // Cache miss, continue to fetch
  }

  return null
}

async function saveToCache(metadata: TokenMetadata): Promise<void> {
  try {
    await supabase.from("token_metadata").upsert(
      {
        mint_address: metadata.address,
        name: metadata.name,
        symbol: metadata.symbol,
        decimals: metadata.decimals,
        logo_uri: metadata.logoURI || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "mint_address" },
    )
    memoryCache.set(metadata.address, metadata)
  } catch (error) {
    console.error(`[v0] Error saving metadata to cache for ${metadata.address}:`, error)
  }
}

export async function fetchTokenMetadata(tokenAddress: string): Promise<TokenMetadata> {
  const cached = await getFromCache(tokenAddress)
  if (cached) {
    console.log(`[v0] ✅ Using cached metadata for ${tokenAddress}: ${cached.name} (${cached.symbol})`)
    return cached
  }

  if (tokenAddress === NATIVE_FOGO) {
    const metadata: TokenMetadata = {
      address: NATIVE_FOGO,
      name: "Wrapped Fogo",
      symbol: "w0G",
      decimals: 9,
    }
    await saveToCache(metadata)
    return metadata
  }

  try {
    console.log(`[v0] 🔍 Fetching metadata for token: ${tokenAddress}`)
    const umi = createUmi(RPC_URL).use(mplTokenMetadata())
    const mint = publicKey(tokenAddress)

    let asset
    try {
      asset = await fetchDigitalAsset(umi, mint)
    } catch (fetchError: any) {
      // If fetchDigitalAsset fails, return a formatted fallback immediately
      console.log(`[v0] fetchDigitalAsset failed for ${tokenAddress}, using fallback`)
      const fallback: TokenMetadata = {
        address: tokenAddress,
        name: `${tokenAddress.slice(0, 4)}...${tokenAddress.slice(-4)}`,
        symbol: tokenAddress.slice(0, 4).toUpperCase(),
        decimals: 9,
      }
      await saveToCache(fallback)
      console.log(`[v0] Fetched metadata for ${tokenAddress}: ${fallback.name} (${fallback.symbol})`)
      return fallback
    }

    const metadata: TokenMetadata = {
      address: tokenAddress,
      name:
        asset.metadata?.name?.replace(/\0/g, "").trim() || `${tokenAddress.slice(0, 4)}...${tokenAddress.slice(-4)}`,
      symbol: asset.metadata?.symbol?.replace(/\0/g, "").trim() || tokenAddress.slice(0, 4).toUpperCase(),
      decimals: 9,
      logoURI: undefined,
    }

    if (asset.metadata?.uri) {
      const normalizedUri = normalizeUri(asset.metadata.uri)

      if (normalizedUri) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)

          const response = await fetch(normalizedUri, {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            const json = await response.json()
            metadata.logoURI = json.image ? normalizeUri(json.image) : undefined
            if (json.name) metadata.name = json.name
            if (json.symbol) metadata.symbol = json.symbol
          }
        } catch (uriError) {
          // Silently fail on URI fetch errors
        }
      }
    }

    console.log(`[v0] ✅ Fetched metadata for ${tokenAddress}: ${metadata.name} (${metadata.symbol})`)

    await saveToCache(metadata)
    return metadata
  } catch (error: any) {
    console.error(`[v0] ❌ Error fetching token metadata for ${tokenAddress}:`, error.message || error)

    const fallback: TokenMetadata = {
      address: tokenAddress,
      name: `${tokenAddress.slice(0, 4)}...${tokenAddress.slice(-4)}`,
      symbol: tokenAddress.slice(0, 4).toUpperCase(),
      decimals: 9,
    }

    await saveToCache(fallback)
    return fallback
  }
}

export async function fetchMultipleTokenMetadata(tokenAddresses: string[]): Promise<Map<string, TokenMetadata>> {
  console.log(`[v0] Batch fetching metadata for ${tokenAddresses.length} tokens...`)
  const results = new Map<string, TokenMetadata>()

  // Fetch in parallel with rate limiting
  const batchSize = 5
  for (let i = 0; i < tokenAddresses.length; i += batchSize) {
    const batch = tokenAddresses.slice(i, i + batchSize)
    const promises = batch.map((addr) => fetchTokenMetadata(addr))
    const metadata = await Promise.all(promises)

    metadata.forEach((meta, idx) => {
      results.set(batch[idx], meta)
    })

    // Small delay to avoid rate limiting
    if (i + batchSize < tokenAddresses.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  console.log(`[v0] Completed batch fetch for ${tokenAddresses.length} tokens`)
  return results
}

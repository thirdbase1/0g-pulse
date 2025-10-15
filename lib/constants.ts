// Fogo Chain Configuration
export const RPC_URL = "https://evmrpc-testnet.0g.ai"
export const RPC_ENDPOINT = RPC_URL

// Explorer URLs
export const export const EXPLORER_URL = "https://chainscan-galileo.0g.ai"

// Token Addresses
export const NATIVE_TOKEN = "0G"

export const SPENDABLE_TOKEN_ADDRESS = NATIVE_FOGO

// Top 4 CA Token Addresses to Track (with metadata)
export const TOP_CA_TOKEN_ADDRESSES = [
  "B7mVgAvW7i2wkcDS6WNCmNYi8FTUWBTScJk3vZ55JN4K",
  "6FzCV3CDRh7fkxdsJgevtVxU9t5bZ6jiJVYUNCk8eVU7",
  "T7dBi3xN9ycJ4rmXMVRv3ZYWDXMZV8Lhap2AZkySV6x",
  "fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry",
]

// Note: Token metadata (symbol, name) should be fetched dynamically via token-fetcher.ts
export const TOP_CA_TOKENS = TOP_CA_TOKEN_ADDRESSES.map((address) => ({
  address,
  // These are temporary fallbacks - real metadata should be fetched via fetchTokenMetadata()
  symbol: `${address.slice(0, 4)}...${address.slice(-4)}`,
  name: "Loading...",
  decimals: 9,
}))

export const TOP_TOKEN_ADDRESSES = TOP_CA_TOKEN_ADDRESSES

// Time Constants
export const DAYS_TO_TRACK = 30
export const FREQUENT_RECIPIENT_THRESHOLD = 10

// Rank Thresholds (based on total volume)
export const RANK_THRESHOLDS = {
  SPARK: 0, // Top 1
  FLAME: 1, // Top 2-10
  EMBER: 10, // Top 11-50
  OG: 50, // 50+
  BLAZE: 100,
  WILDFIRE: 500,
}

// Achievement Definitions
export const ACHIEVEMENTS = {
  // Native FOGO
  FIRST_FIRE: {
    id: "first_fire",
    name: "First Fire",
    description: "Made your first transaction",
    icon: "🪄",
    check: (data: any) => data.totalTransactions > 0,
  },
  CONSISTENT_BURNER: {
    id: "consistent_burner",
    name: "Consistent Burner",
    description: "7-day activity streak",
    icon: "🔥",
    check: (data: any) => data.streakDays >= 7,
  },
  BIG_BURNER: {
    id: "big_burner",
    name: "Big Burner",
    description: "Single transaction > 10k FOGO",
    icon: "💎",
    check: (data: any) => data.maxSingleTx >= 10000,
  },
  FAST_HANDS: {
    id: "fast_hands",
    name: "Fast Hands",
    description: "5+ transactions in 1 minute",
    icon: "⚡",
    check: (data: any) => data.maxTxPerMinute >= 5,
  },

  // CA Tokens
  CA_WHALE: {
    id: "ca_whale",
    name: "CA Whale",
    description: "Holds > 10k of any CA token",
    icon: "🐳",
    check: (data: any) => data.maxCaBalance >= 10000,
  },
  MULTI_TOKEN_BURNER: {
    id: "multi_token_burner",
    name: "Multi-token Burner",
    description: "Interacted with 3+ contracts",
    icon: "🔥",
    check: (data: any) => data.uniqueCaContracts >= 3,
  },
  EARLY_HOLDER: {
    id: "early_holder",
    name: "Early Holder",
    description: "Held top CA before block 1000000",
    icon: "🏹",
    check: (data: any) => data.earlyHolder === true,
  },

  // Community
  VOLCANO_RANK: {
    id: "volcano_rank",
    name: "Volcano Rank",
    description: "Total volume > 100k",
    icon: "🌋",
    check: (data: any) => data.totalVolume >= 100000,
  },
  COSMIC_FLAME: {
    id: "cosmic_flame",
    name: "Cosmic Flame",
    description: "Wallet age > 365 days",
    icon: "🌌",
    check: (data: any) => data.ageDays >= 365,
  },
  NEW_SPARK: {
    id: "new_spark",
    name: "New Spark",
    description: "Joined within last 7 days",
    icon: "🌱",
    check: (data: any) => data.ageDays <= 7,
  },
}

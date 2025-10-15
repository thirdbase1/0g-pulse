// ==========================================
// 0G Pulse Configuration - Galileo Testnet
// ==========================================

// --- Network Configuration ---
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://evmrpc-testnet.0g.ai";
export const CHAIN_ID =
  process.env.NEXT_PUBLIC_CHAIN_ID || "16602";
export const CHAIN_NAME =
  process.env.NEXT_PUBLIC_CHAIN_NAME || "0G-Testnet-Galileo";
export const RPC_ENDPOINT = RPC_URL;

// --- Explorer URLs ---
export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL || "https://chainscan-galileo.0g.ai";

// --- Token Configuration ---
export const NATIVE_TOKEN = "0G";
export const SPENDABLE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // native coin

// --- Top EVM Token Addresses to Track (with metadata placeholders) ---
export const TOP_CA_TOKEN_ADDRESSES = [
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
  "0x3333333333333333333333333333333333333333",
  "0x4444444444444444444444444444444444444444",
];

export const TOP_CA_TOKENS = TOP_CA_TOKEN_ADDRESSES.map((address) => ({
  address,
  // Placeholder values (metadata fetched dynamically later)
  symbol: `${address.slice(0, 6)}...${address.slice(-4)}`,
  name: "Loading...",
  decimals: 18,
}));

export const TOP_TOKEN_ADDRESSES = TOP_CA_TOKEN_ADDRESSES;

// --- Time Constants ---
export const DAYS_TO_TRACK = 30;
export const FREQUENT_RECIPIENT_THRESHOLD = 10;

// --- Rank Thresholds ---
export const RANK_THRESHOLDS = {
  SPARK: 0, // Top 1
  FLAME: 1, // Top 2-10
  EMBER: 10, // Top 11-50
  OG: 50, // 50+
  BLAZE: 100,
  WILDFIRE: 500,
};

// --- Achievement Definitions ---
export const ACHIEVEMENTS = {
  FIRST_FIRE: {
    id: "first_fire",
    name: "First Transaction",
    description: "Made your first transaction",
    icon: "🪄",
    check: (data: any) => data.totalTransactions > 0,
  },
  CONSISTENT_BURNER: {
    id: "consistent_burner",
    name: "Consistent User",
    description: "7-day activity streak",
    icon: "🔥",
    check: (data: any) => data.streakDays >= 7,
  },
  BIG_TRADER: {
    id: "big_trader",
    name: "Big Trader",
    description: "Single transaction > 10k 0G",
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
  CA_WHALE: {
    id: "ca_whale",
    name: "Contract Whale",
    description: "Holds > 10k of any contract token",
    icon: "🐳",
    check: (data: any) => data.maxCaBalance >= 10000,
  },
  MULTI_TOKEN_TRADER: {
    id: "multi_token_trader",
    name: "Multi-Token Trader",
    description: "Interacted with 3+ contracts",
    icon: "🔥",
    check: (data: any) => data.uniqueCaContracts >= 3,
  },
  EARLY_HOLDER: {
    id: "early_holder",
    name: "Early Holder",
    description: "Held top token before block 1,000,000",
    icon: "🏹",
    check: (data: any) => data.earlyHolder === true,
  },
  GALAXY_TRADER: {
    id: "galaxy_trader",
    name: "Galaxy Trader",
    description: "Total volume > 100k",
    icon: "🌋",
    check: (data: any) => data.totalVolume >= 100000,
  },
  COSMIC_HOLDER: {
    id: "cosmic_holder",
    name: "Cosmic Holder",
    description: "Wallet age > 365 days",
    icon: "🌌",
    check: (data: any) => data.ageDays >= 365,
  },
  NEW_STAR: {
    id: "new_star",
    name: "New Star",
    description: "Joined within last 7 days",
    icon: "🌱",
    check: (data: any) => data.ageDays <= 7,
  },
};

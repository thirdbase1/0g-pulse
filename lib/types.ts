export interface WalletData {
  address: string
  nickname?: string
  role: string
  firstTxDate: string
  ageDays: number
  lastActiveDate: string
  nativeBalance: number
  caBalances: CABalance[]
  totalValue: number
  stats: WalletStats
  achievements: Achievement[]
  rank: number
}

export interface CABalance {
  address: string
  symbol: string
  name: string
  balance: number
  decimals: number
}

export interface WalletStats {
  totalSent: number
  totalReceived: number
  totalVolume: number
  totalFees: number
  netBalance: number
  totalTransactions: number
  streakDays: number
  maxSingleTx: number
  maxTxPerMinute: number
  maxCaBalance: number
  uniqueCaContracts: number
  earlyHolder: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

export interface Transaction {
  hash: string
  timestamp: string
  type: string
  token: string
  amount: number
  fee: number
  counterparty: string
  status: string
}

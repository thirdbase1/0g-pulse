import { PublicKey, type ParsedTransactionWithMeta } from "@solana/web3.js"

export interface VolumeData {
  totalSent: number
  totalReceived: number
  totalVolume: number
  totalFees: number
  netBalance: number
  nativeSent: number
  nativeReceived: number
  caSent: number
  caReceived: number
}

export async function calculateWalletVolume(
  walletAddress: string,
  transactions: ParsedTransactionWithMeta[],
): Promise<VolumeData> {
  let totalSent = 0
  let totalReceived = 0
  let totalFees = 0
  let nativeSent = 0
  let nativeReceived = 0
  let caSent = 0
  let caReceived = 0

  const walletPubkey = new PublicKey(walletAddress)

  for (const tx of transactions) {
    if (!tx.meta || tx.meta.err) continue

    // Add transaction fee
    totalFees += (tx.meta.fee || 0) / 1e9

    // Process all balance changes
    const preBalances = tx.meta.preBalances
    const postBalances = tx.meta.postBalances
    const accountKeys = tx.transaction.message.accountKeys

    // Find wallet's account index
    const walletIndex = accountKeys.findIndex((key) => key.pubkey.toString() === walletAddress)

    if (walletIndex !== -1) {
      // Native FOGO balance change
      const preBalance = preBalances[walletIndex] / 1e9
      const postBalance = postBalances[walletIndex] / 1e9
      const nativeChange = postBalance - preBalance

      if (nativeChange > 0) {
        nativeReceived += nativeChange
        totalReceived += nativeChange
      } else if (nativeChange < 0) {
        nativeSent += Math.abs(nativeChange)
        totalSent += Math.abs(nativeChange)
      }
    }

    // Process token balance changes (CA tokens)
    if (tx.meta.preTokenBalances && tx.meta.postTokenBalances) {
      const preTokenBalances = tx.meta.preTokenBalances
      const postTokenBalances = tx.meta.postTokenBalances

      // Match pre and post balances by account index
      for (const postToken of postTokenBalances) {
        if (postToken.owner === walletAddress) {
          const preToken = preTokenBalances.find((pre) => pre.accountIndex === postToken.accountIndex)

          const preAmount = preToken?.uiTokenAmount?.uiAmount || 0
          const postAmount = postToken.uiTokenAmount?.uiAmount || 0
          const tokenChange = postAmount - preAmount

          if (tokenChange > 0) {
            caReceived += tokenChange
            totalReceived += tokenChange
          } else if (tokenChange < 0) {
            caSent += Math.abs(tokenChange)
            totalSent += Math.abs(tokenChange)
          }
        }
      }
    }
  }

  const totalVolume = totalSent + totalReceived
  const netBalance = totalReceived - totalSent - totalFees

  return {
    totalSent,
    totalReceived,
    totalVolume,
    totalFees,
    netBalance,
    nativeSent,
    nativeReceived,
    caSent,
    caReceived,
  }
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins } from "lucide-react"

interface TokenHoldingsProps {
  data: Array<{
    token_address: string
    balance: number
  }>
}

export function TokenHoldings({ data }: TokenHoldingsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num)
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-red-900">Top Token Holdings</CardTitle>
          <Coins className="h-5 w-5 text-red-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length === 0 ? (
            <p className="text-sm text-red-600">No token holdings found</p>
          ) : (
            data.map((token, index) => (
              <div
                key={token.token_address}
                className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-900 font-mono">{shortenAddress(token.token_address)}</p>
                    <p className="text-xs text-red-600">Token Address</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-700">{formatNumber(token.balance)}</p>
                  <p className="text-xs text-red-600">Balance</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

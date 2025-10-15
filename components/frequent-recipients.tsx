import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface FrequentRecipientsProps {
  data: Array<{
    recipient_address: string
    send_count: number
    total_amount_sent: number
  }>
}

export function FrequentRecipients({ data }: FrequentRecipientsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num)
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  const topRecipient = data.length > 0 ? data[0] : null

  return (
    <Card className="border-red-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-red-900">Frequent Recipients</CardTitle>
            <p className="text-sm text-red-700 mt-1">Wallets sent to 10+ times</p>
          </div>
          <Users className="h-5 w-5 text-red-600" />
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-red-600">No frequent recipients found</p>
        ) : (
          <div className="space-y-4">
            {topRecipient && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 border-2 border-red-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-red-600 fire-glow" />
                  <p className="text-xs font-semibold text-red-900 uppercase">Top Recipient</p>
                </div>
                <p className="text-sm font-medium text-red-900 font-mono mb-2">
                  {shortenAddress(topRecipient.recipient_address)}
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-red-700">{topRecipient.send_count}</p>
                    <p className="text-xs text-red-600">sends</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-700">{formatNumber(topRecipient.total_amount_sent)}</p>
                    <p className="text-xs text-red-600">total tokens</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {data.slice(1, 6).map((recipient) => (
                <div
                  key={recipient.recipient_address}
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div>
                    <p className="text-sm font-medium text-red-900 font-mono">
                      {shortenAddress(recipient.recipient_address)}
                    </p>
                    <p className="text-xs text-red-600">{formatNumber(recipient.total_amount_sent)} tokens sent</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-700">{recipient.send_count}</p>
                    <p className="text-xs text-red-600">sends</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

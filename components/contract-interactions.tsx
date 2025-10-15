import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCode } from "lucide-react"

interface ContractInteractionsProps {
  data: {
    total: number
    interactions: Array<{
      contract_address: string
      interaction_count: number
      last_interaction: string
    }>
  }
}

export function ContractInteractions({ data }: ContractInteractionsProps) {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-orange-900">Smart Contract Interactions</CardTitle>
            <p className="text-sm text-orange-700 mt-1">Total contracts: {data.total}</p>
          </div>
          <FileCode className="h-5 w-5 text-orange-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {data.interactions.length === 0 ? (
            <p className="text-sm text-orange-600">No contract interactions found</p>
          ) : (
            data.interactions.slice(0, 10).map((interaction) => (
              <div
                key={interaction.contract_address}
                className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100"
              >
                <div>
                  <p className="text-sm font-medium text-orange-900 font-mono">
                    {shortenAddress(interaction.contract_address)}
                  </p>
                  <p className="text-xs text-orange-600">Last: {formatDate(interaction.last_interaction)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-700">{interaction.interaction_count}</p>
                  <p className="text-xs text-orange-600">interactions</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  History,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { EXPLORER_URL } from "@/lib/constants"

interface Transaction {
  signature: string
  timestamp: number
  type: string
  value: number
  fee: number
  from: string
  to: string
  status: string
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  walletAddress: string
}

export function TransactionHistory({ transactions, walletAddress }: TransactionHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(transactions.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = transactions.slice(startIndex, endIndex)

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(num)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTxDirection = (tx: Transaction) => {
    if (tx.type === "failed") return "failed"
    if (tx.from.toLowerCase() === walletAddress.toLowerCase()) return "sent"
    return "received"
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Recent Transactions ({transactions.length})</CardTitle>
          </div>
          {totalPages > 1 && (
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2">
          {paginatedTransactions.map((tx) => {
            const direction = getTxDirection(tx)
            const isFailed = tx.status !== "Success"

            return (
              <div
                key={tx.signature}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors gap-2"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isFailed ? "bg-destructive/10" : direction === "sent" ? "bg-primary/10" : "bg-accent/10"
                    }`}
                  >
                    {isFailed ? (
                      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                    ) : direction === "sent" ? (
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    ) : (
                      <ArrowDownLeft className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs sm:text-sm font-semibold text-foreground capitalize">{direction}</p>
                      <Badge variant={isFailed ? "destructive" : "default"} className="text-xs">
                        {tx.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs sm:text-sm font-bold text-foreground">{formatNumber(tx.value)} FOGO</p>
                    <p className="text-xs text-muted-foreground">Fee: {formatNumber(tx.fee)}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0" asChild>
                    <a
                      href={`${EXPLORER_URL.fogo}/tx/${tx.signature}?cluster=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on Explorer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )
          })}

          {transactions.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <p className="text-xs sm:text-sm">No transactions found</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import Image from "next/image"

interface WalletSearchProps {
  onSearch: (address: string) => void
  isLoading?: boolean
}

export function WalletSearch({ onSearch, isLoading }: WalletSearchProps) {
  const [address, setAddress] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim()) {
      onSearch(address.trim())
    }
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <Image src="/images/fogo-logo.png" alt="Fogo Logo" width={64} height={64} className="object-contain" />
          </div>
          {/* </CHANGE> */}
          <div>
            <CardTitle className="text-2xl">Fogo Wallet Tracker</CardTitle>
            <CardDescription>Analyze wallet activity on 0G-Testnet-Galileo</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Enter Fogo wallet address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !address.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? (
              <>
                <span className="fire-glow mr-2">🔥</span>
                Analyzing...
              </>
            ) : (
              "Track"
            )}
          </Button>
        </form>
        {isLoading && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Fetching all transactions... This may take a moment for wallets with many transactions.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

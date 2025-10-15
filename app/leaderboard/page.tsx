import { LeaderboardTabs } from "@/components/leaderboard-tabs"
import { WelcomeModal } from "@/components/welcome-modal"
import { Button } from "@/components/ui/button"
import { Home, Network } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <WelcomeModal />

      <header className="border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="fire-float">
                <Image src="/images/fogo-logo.png" alt="Fogo Logo" width={40} height={40} className="object-contain" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                0GPulse
              </h1>
            </div>
            <nav className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/network">
                  <Network className="mr-2 h-4 w-4" />
                  Network
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="fire-float">
                <Image src="/images/fogo-logo.png" alt="Fogo Logo" width={70} height={70} className="object-contain" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Leaderboards
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover the most active wallets and top token holders on 0G-Testnet-Galileo
            </p>
          </div>

          {/* Leaderboard Tabs */}
          <div className="max-w-4xl mx-auto">
            <LeaderboardTabs />
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center mb-6">
            <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider mb-2">Disclaimer</p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto px-4">
              Fogo Testnet is NOT incentivized and this site is built for fun to help you track your wallet activity.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl fire-glow">🔥</span>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Built with <span className="fire-glow">🔥</span> on 0G-Testnet-Galileo Testnet
              </p>
              <p className="text-xs text-muted-foreground">
                © 2025 0GPulse • Created by <span className="font-semibold text-foreground">Second Chance</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

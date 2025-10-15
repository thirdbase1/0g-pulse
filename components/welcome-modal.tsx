"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem("fogopulse-welcome-seen")

    if (!hasSeenWelcome) {
      // Show modal after a brief delay so users see the interface first
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem("fogopulse-welcome-seen", "true")
  }

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleEscape)
      return () => window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md border-2 border-primary/20" aria-describedby="welcome-description">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="text-6xl fire-float fire-glow">🔥</div>
          </div>
          <DialogTitle className="text-2xl text-center gradient-fire">Welcome to 0GPulse!</DialogTitle>
          <DialogDescription id="welcome-description" className="text-center space-y-4 pt-4">
            <p className="text-base text-foreground">
              Fogo Testnet is NOT incentivized, and this site is built for fun to help you track your wallet activity.
            </p>
            <p className="text-sm text-muted-foreground">
              Explore wallet analytics, leaderboards, and network metrics on 0G-Testnet-Galileo.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleClose}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            aria-label="Close welcome message"
          >
            Got it! 🔥
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

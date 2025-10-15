import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "0GPulse – Wallet Tracker & Explorer for 0G-Testnet-Galileo",
  description: "Analyze wallet activity, track achievements, and explore the 0G-Testnet-Galileo network with 0GPulse.",
  keywords: [
    "0G-Testnet-Galileo",
    "wallet tracker",
    "blockchain explorer",
    "crypto analytics",
    "0GPulse",
    "0G token",
    "wallet analysis",
    "blockchain statistics",
    "0G-Testnet-Galileo testnet",
    "crypto wallet tracker",
    "blockchain analytics",
    "DeFi tracker",
    "token holder analytics",
    "wallet leaderboard",
    "crypto portfolio tracker",
    "blockchain data",
    "on-chain analytics",
    "wallet insights",
    "transaction history",
    "token balances",
    "crypto achievements",
    "wallet ranking",
    "blockchain metrics",
    "0G-Testnet-Galileo network",
    "testnet explorer",
  ],
  authors: [{ name: "Second Chance" }],
  creator: "Second Chance",
  publisher: "0GPulse",
  metadataBase: new URL("https://fogopulse.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fogopulse.com",
    siteName: "0GPulse",
    title: "0GPulse – Wallet Tracker & Explorer for 0G-Testnet-Galileo",
    description: "Analyze wallet activity, track achievements, and explore the 0G-Testnet-Galileo network with 0GPulse.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "0GPulse - 0G-Testnet-Galileo Wallet Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ONE_SHOT_SX",
    creator: "@ONE_SHOT_SX",
    title: "0GPulse – Wallet Tracker & Explorer for 0G-Testnet-Galileo",
    description: "Analyze wallet activity, track achievements, and explore the 0G-Testnet-Galileo network with 0GPulse.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "0GPulse",
              description: "Analyze wallet activity, track achievements, and explore the 0G-Testnet-Galileo network",
              url: "https://fogopulse.com",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Organization",
                name: "Second Chance",
              },
            }),
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}

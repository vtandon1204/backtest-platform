// Import global styles
import './globals.css'

// Import metadata types from Next.js
import type { Metadata } from 'next'

// Import Google Font helper
import { Inter } from 'next/font/google'

// Import shared UI components
import Header from '@/components/ui/Header'

// Load the Inter font with Latin subset for consistent typography
const inter = Inter({ subsets: ['latin'] })

// Define default metadata for the app (SEO-friendly)
export const metadata: Metadata = {
  title: 'TradeMind IQ - Advanced Backtesting Platform',
  description: 'Professional trading strategy backtesting and performance analysis',
}

// RootLayout is the entry point for all routes in the app
export default function RootLayout({
  children,
}: {
  children: React.ReactNode // Pages/components rendered inside layout
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-black text-white min-h-screen`}
      >
        {/* Persistent App Header */}
        <Header />

        {/* Main content area where pages will be injected */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}

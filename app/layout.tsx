import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Document Upload",
  description: "A beautiful document upload interface",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="fixed inset-0 -z-10">
          {/* Animated SVG background */}
          <svg className="absolute w-full h-full animate-pulse" style={{ filter: 'blur(8px)' }}>
            <circle cx="20%" cy="30%" r="180" fill="#00B5A5" fillOpacity="0.10">
              <animate attributeName="r" values="180;220;180" dur="8s" repeatCount="indefinite" />
            </circle>
            <circle cx="80%" cy="60%" r="140" fill="#003C64" fillOpacity="0.10">
              <animate attributeName="r" values="140;180;140" dur="10s" repeatCount="indefinite" />
            </circle>
            <circle cx="60%" cy="20%" r="90" fill="#00D1FF" fillOpacity="0.08">
              <animate attributeName="r" values="90;120;90" dur="12s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

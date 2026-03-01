import type { Metadata } from "next"
import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme/provider"
import { TooltipProvider } from "@siws/ui/shadcn/tooltip"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

export const metadata: Metadata = {
  title: "SIWS - Sign In With Solana",
  description: "A standard for authenticating users with Solana wallets",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body style={{ isolation: "isolate" }}>
        <ThemeProvider disableTransitionOnChange attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

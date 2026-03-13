import Link from "next/link"
import { Button } from "@siws/ui/shadcn/button"
import { ArrowRight } from "lucide-react"
import GitHubIcon from "@siws/icons/GitHubIcon"
import { siteConfig } from "@/lib/site"
import { ThemeToggler } from "@/components/theme/toggler"
import Installation from "@/components/installation"

export default function Home() {
  return (
    <div className="mt-30 flex flex-col items-center px-6 pb-16">
      <div className="w-full max-w-md space-y-16">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/" className="font-mono text-sm font-medium tracking-tight">
            open siws
          </Link>
          <nav className="flex items-center">
            <Button size="icon" variant="ghost" nativeButton={false} render={<a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" />}>
              <GitHubIcon className="size-3.5" />
            </Button>
            <ThemeToggler />
          </nav>
        </header>

        {/* Hero */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Sign in with <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="solana-hover">Solana</a>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            A standard for authenticating users with Solana wallets.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/docs/what-is-siws" />}
            >
              Get Started
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/docs/specification" />}
            >
              Specification
            </Button>
          </div>
        </div>

        {/* Install snippet */}
        <Installation />

        {/* Footer */}
        <footer className="">
          <div className="grid grid-cols-2 gap-y-4 -mx-2">
            <Link href="/docs/packages/core" className="group space-y-1 hover:bg-muted rounded-md p-2 transition-colors">
              <p className="font-mono text-sm font-medium group-hover:underline">
                @siws/core
              </p>
              <p className="text-xs text-muted-foreground">
                Message building, parsing &amp; verification.
              </p>
            </Link>
            <Link
              href="/docs/packages/better-auth"
              className="group space-y-1 hover:bg-muted rounded-md p-2 transition-colors"
            >
              <p className="font-mono text-sm font-medium group-hover:underline">
                @siws/better-auth
              </p>
              <p className="text-xs text-muted-foreground">
                Drop-in better-auth plugin.
              </p>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}

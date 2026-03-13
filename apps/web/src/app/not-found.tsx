import Link from "next/link"
import { Button } from "@siws/ui/shadcn/button"
import { ArrowLeft } from "lucide-react"
import { ThemeToggler } from "@/components/theme/toggler"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center px-6 pb-16 pt-30">
      <div className="w-full max-w-md space-y-16">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/" className="font-mono text-sm font-medium tracking-tight">
            open siws
          </Link>
          <nav className="flex items-center">
            <ThemeToggler />
          </nav>
        </header>

        {/* Content */}
        <div>
          <p className="font-mono text-sm text-muted-foreground">404</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl mt-2">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <ArrowLeft data-icon="inline-start" />
              Home
            </Button>
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/docs/what-is-siws" />}
            >
              Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

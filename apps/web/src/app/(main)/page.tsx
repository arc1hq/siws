import Link from "next/link"
import { Button } from "@siws/ui/shadcn/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-16">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Sign In With Solana
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A standard message format and verification process for authenticating Solana wallet owners.
          Secure, human-readable, and interoperable.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button nativeButton={false} render={<Link href="/docs/introduction" />}>
            Get Started
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/docs/specification" />}>
            Read the Spec
          </Button>
        </div>
        <div className="grid gap-4 pt-8 sm:grid-cols-2 text-left">
          <Link
            href="/docs/packages/core"
            className="flex flex-col gap-1.5 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <p className="font-medium">@siws/core</p>
            <p className="text-sm text-muted-foreground">
              Message building, parsing, and Ed25519 signature verification.
            </p>
          </Link>
          <Link
            href="/docs/packages/better-auth"
            className="flex flex-col gap-1.5 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <p className="font-medium">@siws/better-auth</p>
            <p className="text-sm text-muted-foreground">
              Drop-in plugin for better-auth with server and client support.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

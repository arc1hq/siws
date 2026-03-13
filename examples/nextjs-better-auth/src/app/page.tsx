import { Suspense } from "react"
import { SignInCard } from "@/components/sign-in-card"
import { SessionInfo } from "@/components/session-info"
import { ServerSession } from "@/components/server-session"

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-20">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Sign In With Solana
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Connect your wallet, sign a message, get a session. Built with{" "}
          <a
            href="https://www.npmjs.com/package/@siws/better-auth"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-gray-300 underline-offset-2 transition-colors hover:text-foreground"
          >
            @siws/better-auth
          </a>
        </p>
      </header>

      <div className="flex flex-col gap-10">
        <SignInCard />

        <SessionInfo />

        <Suspense
          fallback={
            <section>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-sm font-medium text-foreground">
                  Server-side
                </h2>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  RSC
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              </div>
            </section>
          }
        >
          <ServerSession />
        </Suspense>
      </div>
    </main>
  )
}

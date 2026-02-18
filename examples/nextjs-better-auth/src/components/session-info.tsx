"use client";

import { useSession } from "@/lib/auth-client";

export function SessionInfo() {
  const { data: session, isPending } = useSession();

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-sm font-medium text-foreground">Client-side</h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
          useSession()
        </span>
      </div>

      {isPending ? (
        <div className="space-y-2">
          <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
        </div>
      ) : session ? (
        <div className="rounded-lg border border-gray-100 font-mono text-xs leading-relaxed">
          <pre className="overflow-x-auto p-3 text-gray-500">
            <Pair k="userId" v={session.user.id} />
            {session.user.name && <Pair k="name" v={session.user.name} />}
            {session.user.email && <Pair k="email" v={session.user.email} />}
            <Pair k="token" v={session.session.token} />
            <Pair
              k="expires"
              v={new Date(session.session.expiresAt).toISOString()}
            />
          </pre>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No active session</p>
      )}
    </section>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <span className="block truncate">
      <span className="text-gray-500">{k}</span>
      <span className="text-gray-500">{": "}</span>
      <span className="text-foreground">{v}</span>
    </span>
  );
}

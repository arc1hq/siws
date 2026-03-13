import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function ServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-sm font-medium text-foreground">Server-side</h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
          RSC
        </span>
      </div>

      {session ? (
        <div className="rounded-lg border border-gray-100 font-mono text-xs leading-relaxed">
          <pre className="overflow-x-auto p-3 text-gray-500">
            <Pair k="userId" v={session.user.id} />
            {session.user.name && <Pair k="name" v={session.user.name} />}
            {session.user.email && <Pair k="email" v={session.user.email} />}
          </pre>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No active session</p>
      )}
    </section>
  )
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <span className="block truncate">
      <span className="text-gray-500">{k}</span>
      <span className="text-gray-500">{": "}</span>
      <span className="text-foreground">{v}</span>
    </span>
  )
}

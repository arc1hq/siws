/**
 * Concurrency tests against a real SQL database (node:sqlite, Node >= 22.5),
 * so the unique constraints and transactions the plugin relies on are
 * actually enforced. The memory adapter used elsewhere enforces neither.
 */
import { describe, it, expect, afterEach } from "vitest"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createRequire } from "node:module"
import type { DatabaseSync as DatabaseSyncType } from "node:sqlite"
import { betterAuth, type BetterAuthOptions } from "better-auth"
import { getMigrations } from "better-auth/db/migration"
import { ed25519 } from "@noble/curves/ed25519"
import bs58 from "bs58"
import { siws } from "@/index"
import type { SiwsOptions } from "@/types"

// Loaded via require: Vite 5 (used by vitest 2) does not know the
// `node:sqlite` builtin and fails to resolve a static import of it.
const { DatabaseSync } = createRequire(import.meta.url)(
  "node:sqlite",
) as typeof import("node:sqlite")
type DatabaseSync = DatabaseSyncType

const BASE_URL = "https://example.com"
const SECRET = "test-secret-that-is-long-enough-for-better-auth-0123456789"

const dirs: string[] = []

afterEach(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true })
})

async function createAuth(
  pluginOptions?: SiwsOptions,
  databaseHooks?: BetterAuthOptions["databaseHooks"],
) {
  const dir = mkdtempSync(join(tmpdir(), "siws-"))
  dirs.push(dir)
  const file = join(dir, "auth.db")
  const database = new DatabaseSync(file)
  database.exec("PRAGMA journal_mode = WAL")
  const options = {
    baseURL: BASE_URL,
    secret: SECRET,
    database,
    telemetry: { enabled: false },
    logger: { disabled: true },
    databaseHooks,
    plugins: [siws(pluginOptions)],
  } satisfies BetterAuthOptions
  const { runMigrations } = await getMigrations(options)
  await runMigrations()
  const auth = betterAuth(options)
  return { auth, database, file }
}

type Auth = Awaited<ReturnType<typeof createAuth>>["auth"]

function createWallet(seed: number) {
  const secretKey = new Uint8Array(32).fill(seed)
  return {
    address: bs58.encode(ed25519.getPublicKey(secretKey)),
    sign: (message: string) =>
      bs58.encode(ed25519.sign(new TextEncoder().encode(message), secretKey)),
  }
}

async function post(auth: Auth, path: string, body: unknown) {
  const response = await auth.handler(
    new Request(`${BASE_URL}/api/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  )
  const json = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null
  return { status: response.status, body: json }
}

async function signedBody(
  auth: Auth,
  wallet: ReturnType<typeof createWallet>,
  extra: Record<string, unknown> = {},
) {
  const res = await post(auth, "/siws/nonce", { address: wallet.address })
  expect(res.status).toBe(200)
  const { message } = res.body as { message: string }
  return {
    message,
    signature: wallet.sign(message),
    address: wallet.address,
    ...extra,
  }
}

function count(database: DatabaseSync, table: string): number {
  const row = database
    .prepare(`SELECT COUNT(*) AS n FROM "${table}"`)
    .get() as { n: number }
  return row.n
}

describe("siws concurrency (node:sqlite)", () => {
  it("enforces a unique (address, cluster) index on solanaAddress", async () => {
    const { auth, database } = await createAuth()
    const wallet = createWallet(1)
    const res = await post(auth, "/siws/verify", await signedBody(auth, wallet))
    expect(res.status).toBe(200)

    const link = database
      .prepare(`SELECT * FROM "solanaAddress"`)
      .get() as Record<string, unknown>
    expect(() =>
      database
        .prepare(
          `INSERT INTO "solanaAddress" ("id", "userId", "address", "cluster", "isPrimary", "createdAt") VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          "dup",
          link.userId as string,
          link.address as string,
          link.cluster as string,
          0,
          link.createdAt as string,
        ),
    ).toThrow(/UNIQUE/)
  })

  it("concurrent first sign-ins for one wallet create a single user", async () => {
    const { auth, database } = await createAuth()
    const wallet = createWallet(2)
    const bodies = await Promise.all(
      Array.from({ length: 4 }, () => signedBody(auth, wallet)),
    )

    const results = await Promise.all(
      bodies.map((body) => post(auth, "/siws/verify", body)),
    )

    expect(results.map((r) => r.status)).toEqual([200, 200, 200, 200])
    const userIds = new Set(
      results.map((r) => (r.body?.user as { id: string }).id),
    )
    expect(userIds.size).toBe(1)
    expect(count(database, "user")).toBe(1)
    expect(count(database, "solanaAddress")).toBe(1)
    expect(count(database, "account")).toBe(1)
    expect(count(database, "session")).toBe(4)
  })

  it("concurrent sign-ins claiming one email let only one wallet have it", async () => {
    const { auth, database } = await createAuth({ anonymous: false })
    const email = "shared@example.com"
    const bodies = await Promise.all(
      [createWallet(3), createWallet(4)].map((w) =>
        signedBody(auth, w, { email }),
      ),
    )

    const results = await Promise.all(
      bodies.map((body) => post(auth, "/siws/verify", body)),
    )

    const statuses = results.map((r) => r.status).sort()
    expect(statuses).toEqual([200, 422])
    expect(results.find((r) => r.status === 422)?.body?.code).toBe(
      "EMAIL_ALREADY_IN_USE",
    )
    expect(count(database, "user")).toBe(1)
    expect(count(database, "solanaAddress")).toBe(1)
  })

  it("retries after losing a race and signs into the winner's user", async () => {
    const wallet = createWallet(5)
    let raced = false
    let other: DatabaseSync | undefined
    const winnerId = "winner-user"

    const { auth, database, file } = await createAuth(undefined, {
      user: {
        create: {
          before: async () => {
            if (raced) return
            raced = true
            // A "concurrent" sign-in for the same wallet commits on another
            // connection while our transaction is in flight.
            other = new DatabaseSync(file)
            const now = new Date().toISOString()
            other
              .prepare(
                `INSERT INTO "user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt") VALUES (?, ?, ?, 0, '', ?, ?)`,
              )
              .run(
                winnerId,
                wallet.address,
                `${wallet.address}@siws.local`,
                now,
                now,
              )
            other
              .prepare(
                `INSERT INTO "solanaAddress" ("id", "userId", "address", "cluster", "isPrimary", "createdAt") VALUES (?, ?, ?, 'mainnet-beta', 1, ?)`,
              )
              .run("winner-link", winnerId, wallet.address, now)
            other.close()
          },
        },
      },
    })

    const res = await post(auth, "/siws/verify", await signedBody(auth, wallet))

    expect(raced).toBe(true)
    expect(res.status).toBe(200)
    expect((res.body?.user as { id: string }).id).toBe(winnerId)
    expect(count(database, "user")).toBe(1)
    expect(count(database, "solanaAddress")).toBe(1)
  })
})

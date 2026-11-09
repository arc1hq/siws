import { describe, it, expect, afterEach, beforeEach, vi } from "vitest"
import { betterAuth, type BetterAuthOptions } from "better-auth"
import { memoryAdapter } from "better-auth/adapters/memory"
import { ed25519 } from "@noble/curves/ed25519"
import bs58 from "bs58"
import { SiwsMessage, SiwsMessageBuilder } from "@siws/core"
import { siws, SiwsPluginErrorCode } from "@/index"
import type { SiwsOptions, Cluster } from "@/types"

const BASE_URL = "https://example.com"
const SECRET = "test-secret-that-is-long-enough-for-better-auth-0123456789"

type Row = Record<string, unknown>
type MemoryDB = {
  user: Row[]
  session: Row[]
  account: Row[]
  verification: Row[]
  solanaAddress: Row[]
}

function createDB(): MemoryDB {
  return {
    user: [],
    session: [],
    account: [],
    verification: [],
    solanaAddress: [],
  }
}

function createAuth(
  pluginOptions?: SiwsOptions,
  authOptions?: {
    baseURL?: BetterAuthOptions["baseURL"]
    databaseHooks?: BetterAuthOptions["databaseHooks"]
  },
) {
  const db = createDB()
  const auth = betterAuth({
    baseURL:
      authOptions && "baseURL" in authOptions ? authOptions.baseURL : BASE_URL,
    secret: SECRET,
    database: memoryAdapter(db),
    telemetry: { enabled: false },
    logger: { disabled: true },
    databaseHooks: authOptions?.databaseHooks,
    plugins: [siws(pluginOptions)],
  })
  return { auth, db }
}

type Auth = ReturnType<typeof createAuth>["auth"]

function createWallet(seed: number) {
  const secretKey = new Uint8Array(32).fill(seed)
  const address = bs58.encode(ed25519.getPublicKey(secretKey))
  return {
    address,
    sign: (message: string) =>
      bs58.encode(ed25519.sign(new TextEncoder().encode(message), secretKey)),
  }
}

const wallet = createWallet(1)
const otherWallet = createWallet(2)

async function post(
  auth: Auth,
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
  url = BASE_URL,
) {
  const response = await auth.handler(
    new Request(`${url}/api/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  )
  const json = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null
  return { status: response.status, body: json, headers: response.headers }
}

async function getNonce(
  auth: Auth,
  address = wallet.address,
  cluster?: Cluster,
  headers?: Record<string, string>,
) {
  const res = await post(auth, "/siws/nonce", { address, cluster }, headers)
  expect(res.status).toBe(200)
  return res.body as { nonce: string; message: string }
}

afterEach(() => {
  vi.useRealTimers()
})

describe("siws integration", () => {
  it("test wallets have addresses accepted by core", () => {
    expect(wallet.address.length).toBeGreaterThanOrEqual(43)
    expect(otherWallet.address.length).toBeGreaterThanOrEqual(43)
  })

  it("happy path creates a user, account, address link and session", async () => {
    const { auth, db } = createAuth({ statement: "Sign in to MyApp" })
    const { nonce, message } = await getNonce(auth)

    const parsed = SiwsMessage.parse(message)
    expect(parsed.domain).toBe("example.com")
    expect(parsed.uri).toBe("https://example.com")
    expect(parsed.nonce).toBe(nonce)
    expect(parsed.address).toBe(wallet.address)
    expect(parsed.cluster).toBe("mainnet-beta")
    expect(parsed.statement).toBe("Sign in to MyApp")

    const res = await post(auth, "/siws/verify", {
      message,
      signature: wallet.sign(message),
      address: wallet.address,
    })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      success: true,
      user: { address: wallet.address, cluster: "mainnet-beta" },
    })
    expect(typeof res.body?.token).toBe("string")

    expect(db.user).toHaveLength(1)
    expect(db.user[0]).toMatchObject({
      name: wallet.address,
      email: `${wallet.address}@siws.local`.toLowerCase(),
    })
    expect(db.session).toHaveLength(1)
    expect(db.account).toHaveLength(1)
    expect(db.account[0]).toMatchObject({
      providerId: "siws",
      accountId: `${wallet.address}:mainnet-beta`,
    })
    expect(db.solanaAddress).toHaveLength(1)
    expect(db.solanaAddress[0]).toMatchObject({
      address: wallet.address,
      cluster: "mainnet-beta",
      isPrimary: true,
    })
    expect(db.verification).toHaveLength(0)

    const cookie = res.headers.get("set-cookie")
    expect(cookie).toContain("better-auth.session_token")

    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookie!.split(";")[0]! }),
    })
    expect(session?.user.id).toBe(db.user[0]!.id)
  })

  it("works via auth.api without an incoming request", async () => {
    const { auth, db } = createAuth()
    const { message } = await auth.api.getSiwsNonce({
      body: { address: wallet.address },
    })
    const result = await auth.api.verifySiwsMessage({
      body: {
        message,
        signature: wallet.sign(message),
        address: wallet.address,
      },
    })
    expect(result.success).toBe(true)
    expect(result.user.address).toBe(wallet.address)
    expect(db.session).toHaveLength(1)
  })

  it("signing in again reuses the user and links other clusters", async () => {
    const { auth, db } = createAuth()

    for (const cluster of ["mainnet-beta", "mainnet-beta", "devnet"] as const) {
      const { message } = await getNonce(auth, wallet.address, cluster)
      const res = await post(auth, "/siws/verify", {
        message,
        signature: wallet.sign(message),
        address: wallet.address,
        cluster,
      })
      expect(res.status).toBe(200)
    }

    expect(db.user).toHaveLength(1)
    expect(db.session).toHaveLength(3)
    expect(db.solanaAddress).toHaveLength(2)
    expect(db.solanaAddress.find((a) => a.cluster === "devnet")).toMatchObject({
      isPrimary: false,
      userId: db.user[0]!.id,
    })
    expect(db.account).toHaveLength(2)
  })

  it("rejects nonce reuse", async () => {
    const { auth } = createAuth()
    const { message } = await getNonce(auth)
    const body = {
      message,
      signature: wallet.sign(message),
      address: wallet.address,
    }

    expect((await post(auth, "/siws/verify", body)).status).toBe(200)

    const replay = await post(auth, "/siws/verify", body)
    expect(replay.status).toBe(401)
    expect(replay.body?.code).toBe(SiwsPluginErrorCode.INVALID_OR_EXPIRED_NONCE)
  })

  it("rejects a wrong signature and consumes the nonce", async () => {
    const { auth, db } = createAuth()
    const { message } = await getNonce(auth)

    const bad = await post(auth, "/siws/verify", {
      message,
      signature: otherWallet.sign(message),
      address: wallet.address,
    })
    expect(bad.status).toBe(401)
    expect(bad.body?.code).toBe(SiwsPluginErrorCode.VERIFICATION_FAILED)

    // The failed attempt consumed the nonce, so a valid signature over the
    // same message is now rejected too.
    const retry = await post(auth, "/siws/verify", {
      message,
      signature: wallet.sign(message),
      address: wallet.address,
    })
    expect(retry.status).toBe(401)
    expect(retry.body?.code).toBe(SiwsPluginErrorCode.INVALID_OR_EXPIRED_NONCE)
    expect(db.user).toHaveLength(0)
  })

  it("rejects a garbage signature", async () => {
    const { auth } = createAuth()
    const { message } = await getNonce(auth)
    const res = await post(auth, "/siws/verify", {
      message,
      signature: "not-base58-0OIl",
      address: wallet.address,
    })
    expect(res.status).toBe(401)
    expect(res.body?.code).toBe(SiwsPluginErrorCode.VERIFICATION_FAILED)
  })

  it("rejects a message signed for a spoofed domain", async () => {
    const { auth, db } = createAuth()
    const { message } = await getNonce(auth)
    const issued = SiwsMessage.parse(message)

    const spoofed = new SiwsMessageBuilder()
      .domain("evil.com")
      .address(issued.address)
      .uri("https://evil.com")
      .nonce(issued.nonce)
      .issuedAt(issued.issuedAt)
      .expirationTime(issued.expirationTime!)
      .cluster(issued.cluster)
      .build()
      .toMessage()

    const res = await post(
      auth,
      "/siws/verify",
      {
        message: spoofed,
        signature: wallet.sign(spoofed),
        address: wallet.address,
      },
      { origin: "https://evil.com", host: "evil.com" },
      "https://evil.com",
    )
    expect(res.status).toBe(401)
    expect(res.body?.code).toBe(SiwsPluginErrorCode.DOMAIN_MISMATCH)
    expect(db.session).toHaveLength(0)
  })

  it("rejects a cluster mismatch between message and request", async () => {
    const { auth } = createAuth()
    const { message } = await getNonce(auth, wallet.address, "devnet")
    const res = await post(auth, "/siws/verify", {
      message,
      signature: wallet.sign(message),
      address: wallet.address,
      cluster: "mainnet-beta",
    })
    expect(res.status).toBe(401)
    expect(res.body?.code).toBe(SiwsPluginErrorCode.CLUSTER_MISMATCH)
  })

  it("rejects an address mismatch between message and request", async () => {
    const { auth } = createAuth()
    const { message } = await getNonce(auth)
    const res = await post(auth, "/siws/verify", {
      message,
      signature: wallet.sign(message),
      address: otherWallet.address,
    })
    expect(res.status).toBe(401)
    expect(res.body?.code).toBe(SiwsPluginErrorCode.ADDRESS_MISMATCH)
  })

  it("rejects an expired nonce", async () => {
    const { auth, db } = createAuth({ expirationTime: 60 })
    const { message } = await getNonce(auth)

    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(Date.now() + 61_000)

    const res = await post(auth, "/siws/verify", {
      message,
      signature: wallet.sign(message),
      address: wallet.address,
    })
    expect(res.status).toBe(401)
    expect(res.body?.code).toBe(SiwsPluginErrorCode.INVALID_OR_EXPIRED_NONCE)
    expect(db.session).toHaveLength(0)
  })

  it("rejects a nonce that was never issued", async () => {
    const { auth } = createAuth()
    const { message } = await getNonce(auth)
    const issued = SiwsMessage.parse(message)
    const forged = message.replace(issued.nonce, "ForgedNonce1234567")

    const res = await post(auth, "/siws/verify", {
      message: forged,
      signature: wallet.sign(forged),
      address: wallet.address,
    })
    expect(res.status).toBe(401)
    expect(res.body?.code).toBe(SiwsPluginErrorCode.INVALID_OR_EXPIRED_NONCE)
  })

  it("rejects an unparseable message", async () => {
    const { auth } = createAuth()
    const res = await post(auth, "/siws/verify", {
      message: "hello",
      signature: wallet.sign("hello"),
      address: wallet.address,
    })
    expect(res.status).toBe(400)
    expect(res.body?.code).toBe(SiwsPluginErrorCode.INVALID_MESSAGE)
  })

  it("takes the domain from baseURL, not from spoofed Origin/Host headers", async () => {
    const { auth } = createAuth()
    const { message } = await post(
      auth,
      "/siws/nonce",
      { address: wallet.address },
      { origin: "https://evil.com", host: "evil.com" },
      "https://evil.com",
    ).then((r) => r.body as { message: string })

    const parsed = SiwsMessage.parse(message)
    expect(parsed.domain).toBe("example.com")
    expect(parsed.uri).toBe("https://example.com")
    expect(message.startsWith("example.com wants you to sign in")).toBe(true)

    // Verification also ignores the headers.
    const res = await post(
      auth,
      "/siws/verify",
      { message, signature: wallet.sign(message), address: wallet.address },
      { origin: "https://evil.com", host: "evil.com" },
      "https://evil.com",
    )
    expect(res.status).toBe(200)
  })

  it("keeps the port of the base URL in the domain", async () => {
    const { auth } = createAuth(undefined, {
      baseURL: "http://localhost:3000",
    })
    const { message } = await auth.api.getSiwsNonce({
      body: { address: wallet.address },
    })
    const parsed = SiwsMessage.parse(message)
    expect(parsed.domain).toBe("localhost:3000")
    expect(parsed.uri).toBe("http://localhost:3000")
  })

  it("uses explicit domain and uri options", async () => {
    const { auth } = createAuth({
      domain: "app.example.org",
      uri: "https://app.example.org/login",
    })
    const { message } = await getNonce(auth)
    const parsed = SiwsMessage.parse(message)
    expect(parsed.domain).toBe("app.example.org")
    expect(parsed.uri).toBe("https://app.example.org/login")

    const res = await post(auth, "/siws/verify", {
      message,
      signature: wallet.sign(message),
      address: wallet.address,
    })
    expect(res.status).toBe(200)
  })

  describe("without a configured base URL", () => {
    const envKeys = [
      "BETTER_AUTH_URL",
      "NEXT_PUBLIC_BETTER_AUTH_URL",
      "PUBLIC_BETTER_AUTH_URL",
      "NUXT_PUBLIC_BETTER_AUTH_URL",
      "NUXT_PUBLIC_AUTH_URL",
      "BASE_URL",
    ]
    let saved: (readonly [string, string | undefined])[] = []

    beforeEach(() => {
      saved = envKeys.map((k) => [k, process.env[k]] as const)
      envKeys.forEach((k) => delete process.env[k])
    })
    afterEach(() => {
      saved.forEach(([k, v]) => {
        if (v !== undefined) process.env[k] = v
      })
    })

    it("auth.api returns DOMAIN_NOT_CONFIGURED", async () => {
      const { auth } = createAuth(undefined, { baseURL: undefined })
      await expect(
        auth.api.getSiwsNonce({ body: { address: wallet.address } }),
      ).rejects.toMatchObject({
        body: { code: SiwsPluginErrorCode.DOMAIN_NOT_CONFIGURED },
      })
    })

    it("HTTP requests with a spoofed Host get DOMAIN_NOT_CONFIGURED", async () => {
      const { auth, db } = createAuth(undefined, { baseURL: undefined })
      const headers = { host: "evil.com", origin: "https://evil.com" }

      // Repeated requests: better-auth derives a per-request base URL from
      // the request; none of them may leak into the SIWS domain.
      for (let i = 0; i < 2; i++) {
        const nonce = await post(
          auth,
          "/siws/nonce",
          { address: wallet.address },
          headers,
          "https://evil.com",
        )
        expect(nonce.status).toBe(500)
        expect(nonce.body?.code).toBe(SiwsPluginErrorCode.DOMAIN_NOT_CONFIGURED)
        expect(JSON.stringify(nonce.body)).not.toContain("evil.com")
      }
      expect(db.verification).toHaveLength(0)

      const message = new SiwsMessageBuilder()
        .domain("evil.com")
        .address(wallet.address)
        .uri("https://evil.com")
        .nonce("abcdefgh1234")
        .issuedAt(new Date())
        .cluster("mainnet-beta")
        .build()
        .toMessage()
      const verify = await post(
        auth,
        "/siws/verify",
        { message, signature: wallet.sign(message), address: wallet.address },
        headers,
        "https://evil.com",
      )
      expect(verify.status).toBe(500)
      expect(verify.body?.code).toBe(SiwsPluginErrorCode.DOMAIN_NOT_CONFIGURED)
      expect(db.session).toHaveLength(0)
    })

    it("treats a dynamic baseURL config as not configured", async () => {
      const { auth } = createAuth(undefined, {
        baseURL: { allowedHosts: ["example.com"], protocol: "https" },
      })
      const res = await post(auth, "/siws/nonce", { address: wallet.address })
      expect(res.status).toBe(500)
      expect(res.body?.code).toBe(SiwsPluginErrorCode.DOMAIN_NOT_CONFIGURED)
    })

    it("uses BETTER_AUTH_URL when set", async () => {
      process.env[envKeys[0]!] = "https://env.example.com" // BETTER_AUTH_URL
      const { auth } = createAuth(undefined, { baseURL: undefined })
      const res = await post(
        auth,
        "/siws/nonce",
        { address: wallet.address },
        { host: "evil.com" },
        "https://evil.com",
      )
      expect(res.status).toBe(200)
      const parsed = SiwsMessage.parse(
        (res.body as { message: string }).message,
      )
      expect(parsed.domain).toBe("env.example.com")
      expect(parsed.uri).toBe("https://env.example.com")
    })

    it("uses explicit domain and uri options", async () => {
      const { auth } = createAuth(
        { domain: "example.com", uri: "https://example.com" },
        { baseURL: undefined },
      )
      const res = await post(
        auth,
        "/siws/nonce",
        { address: wallet.address },
        { host: "evil.com" },
        "https://evil.com",
      )
      expect(res.status).toBe(200)
      const parsed = SiwsMessage.parse(
        (res.body as { message: string }).message,
      )
      expect(parsed.domain).toBe("example.com")
    })
  })

  it("lets only one of several concurrent verifies use a nonce", async () => {
    const { auth, db } = createAuth()
    const { message } = await getNonce(auth)
    const body = {
      message,
      signature: wallet.sign(message),
      address: wallet.address,
    }

    const results = await Promise.all(
      Array.from({ length: 5 }, () => post(auth, "/siws/verify", body)),
    )
    const statuses = results.map((r) => r.status).sort()
    expect(statuses).toEqual([200, 401, 401, 401, 401])
    expect(db.session).toHaveLength(1)
  })

  it("rejects invalid plugin options at construction time", () => {
    expect(() => siws({ domain: "https://example.com" })).toThrow(/domain/)
    expect(() => siws({ domain: "example.com/path" })).toThrow(/domain/)
    expect(() => siws({ uri: "not a uri" })).toThrow(/uri/)
    // Values only @siws/core rejects must also fail at construction time,
    // not on every /siws/nonce request.
    expect(() => siws({ domain: "example.com:abc" })).toThrow(/domain/i)
    expect(() => siws({ statement: "Connexion à MyApp" })).toThrow(/statement/i)
    expect(() => siws({ resources: ["not a uri"] })).toThrow(/resource/i)
  })

  it("maps body validation failures to plugin error codes", async () => {
    const { auth } = createAuth()

    const badAddress = await post(auth, "/siws/nonce", { address: "abc" })
    expect(badAddress.status).toBe(400)
    expect(badAddress.body?.code).toBe(SiwsPluginErrorCode.INVALID_ADDRESS)

    // The plugin accepts exactly the addresses @siws/core accepts.
    const candidates = [
      wallet.address,
      "11111111111111111111111111111111", // 32 chars, 32 zero bytes
      "z".repeat(32), // 32 chars but not a 32-byte key
      "z".repeat(44), // 44 chars but more than 32 bytes
      `${wallet.address}1`, // 45 chars
    ]
    for (const address of candidates) {
      let coreAccepts = true
      try {
        new SiwsMessageBuilder()
          .domain("example.com")
          .address(address)
          .uri(BASE_URL)
          .nonce("abcdefgh1234")
          .issuedAt(new Date())
          .cluster("mainnet-beta")
          .build()
      } catch {
        coreAccepts = false
      }

      const res = await post(auth, "/siws/nonce", { address })
      if (coreAccepts) {
        expect(res.status, address).toBe(200)
      } else {
        expect(res.status, address).toBe(400)
        expect(res.body?.code, address).toBe(
          SiwsPluginErrorCode.INVALID_ADDRESS,
        )
      }
    }

    const badCluster = await post(auth, "/siws/nonce", {
      address: wallet.address,
      cluster: "localnet",
    })
    expect(badCluster.status).toBe(400)
    expect(badCluster.body?.code).toBe(SiwsPluginErrorCode.INVALID_CLUSTER)
  })

  describe("anonymous: false", () => {
    it("requires an email", async () => {
      const { auth } = createAuth({ anonymous: false })
      const { message } = await getNonce(auth)
      const res = await post(auth, "/siws/verify", {
        message,
        signature: wallet.sign(message),
        address: wallet.address,
      })
      expect(res.status).toBe(400)
      expect(res.body?.code).toBe(SiwsPluginErrorCode.EMAIL_REQUIRED)
    })

    it("creates the user with the given email", async () => {
      const { auth, db } = createAuth({ anonymous: false })
      const { message } = await getNonce(auth)
      const res = await post(auth, "/siws/verify", {
        message,
        signature: wallet.sign(message),
        address: wallet.address,
        email: "alice@example.com",
      })
      expect(res.status).toBe(200)
      expect(db.user[0]).toMatchObject({ email: "alice@example.com" })
    })

    it("does not create a second user with an existing email", async () => {
      const { auth, db } = createAuth({ anonymous: false })

      const first = await getNonce(auth)
      await post(auth, "/siws/verify", {
        message: first.message,
        signature: wallet.sign(first.message),
        address: wallet.address,
        email: "alice@example.com",
      })

      const { message } = await getNonce(auth, otherWallet.address)
      const res = await post(auth, "/siws/verify", {
        message,
        signature: otherWallet.sign(message),
        address: otherWallet.address,
        email: "alice@example.com",
      })
      expect(res.status).toBe(422)
      expect(res.body?.code).toBe(SiwsPluginErrorCode.EMAIL_ALREADY_IN_USE)
      expect(db.user).toHaveLength(1)
    })
  })

  it("returns a generic 500 without leaking internal error messages", async () => {
    const { auth } = createAuth(undefined, {
      baseURL: BASE_URL,
      databaseHooks: {
        user: {
          create: {
            before: async () => {
              throw new Error("connection to db-internal:5432 refused")
            },
          },
        },
      },
    })
    const { message } = await getNonce(auth)
    const res = await post(auth, "/siws/verify", {
      message,
      signature: wallet.sign(message),
      address: wallet.address,
    })
    expect(res.status).toBe(500)
    expect(JSON.stringify(res.body)).not.toContain("db-internal")
  })
})

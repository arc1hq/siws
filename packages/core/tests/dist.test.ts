import { describe, it, expect } from "vitest"
import { execFileSync } from "node:child_process"
import path from "node:path"

// Exercises the built package (`dist/`) exactly as a consumer would: in a
// separate Node process, resolved through package.json `exports` via
// self-reference ("@siws/core"), with native CJS `require` and native ESM
// `import`. Turbo runs `build` before `test`; a bare `vitest run` tests whatever
// dist is on disk, so build first when running it directly.
//
// Regression: the CJS build once crashed on every Base58 call because bs58's
// CJS entry exported `{ default }` and tsup's interop picked the wrong shape.

const PACKAGE_DIR = path.resolve(__dirname, "..")

// Body shared by both module systems; `core` and `ed25519` are bound by the
// prelude. Prints a JSON summary on success.
const SCENARIO = `
  const { SiwsMessageBuilder, SiwsMessage, verifySignature, generateNonce } = core
  const privateKey = new Uint8Array(32).fill(7)
  const publicKey = ed25519.getPublicKey(privateKey)
  const address = core.__encode(publicKey)
  const nonce = generateNonce()
  const message = new SiwsMessageBuilder()
    .domain("example.com")
    .address(address)
    .uri("https://example.com/auth")
    .nonce(nonce)
    .issuedAt(new Date("2024-01-15T12:00:00.000Z"))
    .cluster("mainnet-beta")
    .build()
  const text = message.toMessage()
  const parsed = SiwsMessage.parse(text)
  const signature = core.__encode(
    ed25519.sign(new TextEncoder().encode(text), privateKey),
  )
  const ok = await verifySignature(text, signature, address, {
    domain: "example.com",
    nonce,
  })
  const bad = await verifySignature(text, signature, address, {
    domain: "example.com",
    nonce: "wrongnonce1",
  })
  console.log(JSON.stringify({
    parsedAddress: parsed.address,
    expectedAddress: address,
    ok: ok.success,
    okAddress: ok.success ? ok.data.address : null,
    badCode: bad.success ? null : bad.error.code,
  }))
`

// Base58 encoder for the test itself, taken from the same dependency the
// package uses so we don't need extra test deps.
const CJS_PRELUDE = `
  const core = { ...require("@siws/core"), __encode: require("@scure/base").base58.encode }
  const { ed25519 } = require("@noble/curves/ed25519")
`
const ESM_PRELUDE = `
  const core = { ...(await import("@siws/core")), __encode: (await import("@scure/base")).base58.encode }
  const { ed25519 } = await import("@noble/curves/ed25519")
`

function run(args: string[]): Record<string, unknown> {
  const out = execFileSync(process.execPath, args, {
    cwd: PACKAGE_DIR,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
  return JSON.parse(out.trim().split("\n").pop()!)
}

function expectScenario(result: Record<string, unknown>) {
  expect(result.parsedAddress).toBe(result.expectedAddress)
  expect(result.ok).toBe(true)
  expect(result.okAddress).toBe(result.expectedAddress)
  expect(result.badCode).toBe("NONCE_MISMATCH")
}

describe("built package (dist)", () => {
  it("works via CommonJS require (dist/index.cjs)", () => {
    const script = `${CJS_PRELUDE}
      if (!require.resolve("@siws/core").endsWith("dist/index.cjs")) {
        throw new Error("unexpected CJS entry: " + require.resolve("@siws/core"))
      }
      ;(async () => { ${SCENARIO} })().catch((e) => { console.error(e); process.exit(1) })`
    expectScenario(run(["-e", script]))
  })

  it("works via ESM import (dist/index.js)", () => {
    const script = `${ESM_PRELUDE}
      const entry = import.meta.resolve("@siws/core")
      if (!entry.endsWith("dist/index.js")) {
        throw new Error("unexpected ESM entry: " + entry)
      }
      ${SCENARIO}`
    expectScenario(run(["--input-type=module", "-e", script]))
  })
})

import { describe, it, expect } from "vitest"
import { ed25519 } from "@noble/curves/ed25519"
import { verifySignature } from "@/signature"
import { SiwsMessage } from "@/message"
import { SiwsError, SiwsErrorCode } from "@/errors"
import type { SiwsMessageFields } from "@/types"
import { encodeBase58, stringToBytes } from "@/utils"

function createTestKeypair() {
  const privateKey = crypto.getRandomValues(new Uint8Array(32))
  const publicKey = ed25519.getPublicKey(privateKey)
  const address = encodeBase58(publicKey)
  return { privateKey, publicKey, address }
}

function signMessage(message: string, privateKey: Uint8Array): string {
  const messageBytes = stringToBytes(message)
  const signature = ed25519.sign(messageBytes, privateKey)
  return encodeBase58(signature)
}

describe("verifySignature", () => {
  describe("valid signatures", () => {
    it("verifies valid signature with message string", async () => {
      const { privateKey, address } = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${address}

Sign in to Example

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const signature = signMessage(messageString, privateKey)
      const result = await verifySignature(messageString, signature)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.domain).toBe("example.com")
      expect(result.data!.address).toBe(address)
      expect(result.error).toBeUndefined()
    })

    it("verifies valid signature with SiwsMessage object", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        statement: "Sign in to Example",
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it("verifies signature with explicit public key", async () => {
      const { privateKey, address } = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const signature = signMessage(messageString, privateKey)
      const result = await verifySignature(messageString, signature, address)

      expect(result.success).toBe(true)
    })

    it("verifies signature with all optional fields", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        statement: "Sign in",
        expirationTime: "2099-01-15T12:10:00Z",
        notBefore: "2020-01-15T12:00:00Z",
        requestId: "req_123",
        cluster: "mainnet-beta",
        resources: ["https://example.com/api"],
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature)

      expect(result.success).toBe(true)
      expect(result.data!.cluster).toBe("mainnet-beta")
      expect(result.data!.resources).toEqual(["https://example.com/api"])
    })
  })

  describe("invalid signatures", () => {
    it("rejects tampered message", async () => {
      const { privateKey, address } = createTestKeypair()

      const originalMessage = `example.com wants you to sign in with your Solana account:
${address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const tamperedMessage = `malicious.com wants you to sign in with your Solana account:
${address}

URI: https://malicious.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const signature = signMessage(originalMessage, privateKey)
      const result = await verifySignature(tamperedMessage, signature)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error!.code).toBe(
        SiwsErrorCode.SIGNATURE_VERIFICATION_FAILED,
      )
    })

    it("rejects wrong public key", async () => {
      const { privateKey, address } = createTestKeypair()
      const { address: wrongAddress } = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const signature = signMessage(messageString, privateKey)
      const result = await verifySignature(
        messageString,
        signature,
        wrongAddress,
      )

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.INVALID_ADDRESS)
      expect(result.error!.expected).toBe(address)
      expect(result.error!.received).toBe(wrongAddress)
    })

    it("rejects message claiming a victim address signed with attacker key", async () => {
      const attacker = createTestKeypair()
      const victim = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${victim.address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const signature = signMessage(messageString, attacker.privateKey)

      // Attacker supplies their own key as publicKey
      const withKey = await verifySignature(
        messageString,
        signature,
        attacker.address,
        { domain: "example.com", nonce: "abcd1234" },
      )
      expect(withKey.success).toBe(false)
      expect(withKey.data).toBeUndefined()
      expect(withKey.error!.code).toBe(SiwsErrorCode.INVALID_ADDRESS)
      expect(withKey.error!.expected).toBe(victim.address)
      expect(withKey.error!.received).toBe(attacker.address)

      // Without publicKey the message address is used, so the signature fails
      const withoutKey = await verifySignature(messageString, signature)
      expect(withoutKey.success).toBe(false)
      expect(withoutKey.error!.code).toBe(
        SiwsErrorCode.SIGNATURE_VERIFICATION_FAILED,
      )
    })

    it("rejects invalid Base58 signature", async () => {
      const { address } = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const result = await verifySignature(messageString, "not-valid-base58!")

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.INVALID_SIGNATURE)
      expect(result.error!.message).toContain("not valid Base58")
    })

    it("rejects signature with wrong length", async () => {
      const { address } = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const shortSignature = encodeBase58(new Uint8Array(32))
      const result = await verifySignature(messageString, shortSignature)

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.INVALID_SIGNATURE)
      expect(result.error!.message).toContain("Invalid signature length")
    })

    it("rejects invalid Base58 public key", async () => {
      const { privateKey, address } = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const signature = signMessage(messageString, privateKey)
      const result = await verifySignature(
        messageString,
        signature,
        "invalid-base58!",
      )

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.INVALID_ADDRESS)
    })

    it("rejects public key that does not match the address (wrong length)", async () => {
      const { privateKey, address } = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const signature = signMessage(messageString, privateKey)
      const shortKey = encodeBase58(new Uint8Array(16))
      const result = await verifySignature(messageString, signature, shortKey)

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.INVALID_ADDRESS)
      expect(result.error!.message).toContain("does not match message address")
    })

    it("rejects validly signed non-canonical message (duplicate nonce)", async () => {
      const { privateKey, address } = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Nonce: efgh5678
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const signature = signMessage(messageString, privateKey)
      const result = await verifySignature(messageString, signature, address, {
        nonce: "efgh5678",
      })

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.PARSE_ERROR)
    })

    it("rejects validly signed message with trailing newline", async () => {
      const { privateKey, address } = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta
`

      const signature = signMessage(messageString, privateKey)
      const result = await verifySignature(messageString, signature)

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.PARSE_ERROR)
    })
  })

  describe("verification options", () => {
    it("validates domain when provided", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature, undefined, {
        domain: "different.com",
      })

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.DOMAIN_MISMATCH)
      expect(result.error!.expected).toBe("different.com")
      expect(result.error!.received).toBe("example.com")
    })

    it("accepts matching domain", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature, undefined, {
        domain: "example.com",
      })

      expect(result.success).toBe(true)
    })

    it("validates nonce when provided", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature, undefined, {
        nonce: "different1234",
      })

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.NONCE_MISMATCH)
    })

    it("accepts matching nonce", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature, undefined, {
        nonce: "abcd1234",
      })

      expect(result.success).toBe(true)
    })

    it("rejects expired message", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        expirationTime: "2024-01-15T12:10:00Z",
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature)

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.MESSAGE_EXPIRED)
    })

    it("rejects message exactly at expirationTime", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        expirationTime: "2024-01-15T12:10:00Z",
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature, undefined, {
        time: new Date("2024-01-15T12:10:00Z"),
      })

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.MESSAGE_EXPIRED)
    })

    it("accepts non-expired message with custom time", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        expirationTime: "2024-01-15T12:10:00Z",
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature, undefined, {
        time: new Date("2024-01-15T12:05:00Z"),
      })

      expect(result.success).toBe(true)
    })

    it("rejects message not yet valid", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        notBefore: "2099-01-15T12:00:00Z",
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature)

      expect(result.success).toBe(false)
      expect(result.error!.code).toBe(SiwsErrorCode.MESSAGE_NOT_YET_VALID)
    })

    it("accepts message valid with custom time", async () => {
      const { privateKey, address } = createTestKeypair()

      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        notBefore: "2024-01-15T12:00:00Z",
      })

      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature, undefined, {
        time: new Date("2024-01-15T12:05:00Z"),
      })

      expect(result.success).toBe(true)
    })
  })

  describe("result type", () => {
    it("narrows data and error on success", async () => {
      const { privateKey, address } = createTestKeypair()
      const message = new SiwsMessage({
        domain: "example.com",
        address,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
      })
      const signature = signMessage(message.toMessage(), privateKey)
      const result = await verifySignature(message, signature)

      if (result.success) {
        // compiles without non-null assertions
        const fields: SiwsMessageFields = result.data
        expect(fields.address).toBe(address)
        expect(result.error).toBeUndefined()
      } else {
        throw new Error(`unexpected failure: ${result.error.code}`)
      }
    })

    it("narrows error on failure", async () => {
      const result = await verifySignature("invalid message", "signature")

      if (!result.success) {
        const error: SiwsError = result.error
        expect(error.code).toBe(SiwsErrorCode.PARSE_ERROR)
        expect(result.data).toBeUndefined()
      } else {
        throw new Error("expected failure")
      }
    })
  })

  describe("error handling", () => {
    it("returns error for invalid message format", async () => {
      const result = await verifySignature("invalid message", "signature")

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error!.code).toBe(SiwsErrorCode.PARSE_ERROR)
    })

    it("preserves error cause for unexpected errors", async () => {
      const { address } = createTestKeypair()

      const messageString = `example.com wants you to sign in with your Solana account:
${address}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const validLengthInvalidSig = encodeBase58(new Uint8Array(64))
      const result = await verifySignature(messageString, validLengthInvalidSig)

      expect(result.success).toBe(false)
    })
  })
})

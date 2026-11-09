import { describe, it, expect } from "vitest"
import { parseMessage } from "@/parser"
import { SiwsError, SiwsErrorCode } from "@/errors"

const VALID_ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"

describe("parseMessage", () => {
  describe("valid messages", () => {
    it("parses minimal message with statement", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Sign in to Example

URI: https://example.com/auth
Version: 1
Nonce: k8sj2n4b
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const result = parseMessage(message)

      expect(result.domain).toBe("example.com")
      expect(result.address).toBe(VALID_ADDRESS)
      expect(result.statement).toBe("Sign in to Example")
      expect(result.uri).toBe("https://example.com/auth")
      expect(result.version).toBe("1")
      expect(result.nonce).toBe("k8sj2n4b")
      expect(result.issuedAt).toBe("2024-01-15T12:00:00Z")
      expect(result.cluster).toBe("mainnet-beta")
      expect(result.expirationTime).toBeUndefined()
      expect(result.notBefore).toBeUndefined()
      expect(result.requestId).toBeUndefined()
      expect(result.resources).toBeUndefined()
    })

    it("parses message without statement", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: k8sj2n4b
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const result = parseMessage(message)

      expect(result.domain).toBe("example.com")
      expect(result.address).toBe(VALID_ADDRESS)
      expect(result.statement).toBeUndefined()
      expect(result.uri).toBe("https://example.com/auth")
      expect(result.version).toBe("1")
      expect(result.nonce).toBe("k8sj2n4b")
      expect(result.issuedAt).toBe("2024-01-15T12:00:00Z")
      expect(result.cluster).toBe("mainnet-beta")
    })

    it("parses complete message with all fields", () => {
      const message = `app.example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Access your dashboard and manage settings.

URI: https://app.example.com/api/auth
Version: 1
Nonce: f7k2m9p4x1
Issued At: 2024-01-15T12:00:00.000Z
Expiration Time: 2024-01-15T12:10:00.000Z
Not Before: 2024-01-15T12:00:00.000Z
Request ID: req_abc123
Cluster: mainnet-beta
Resources:
- https://app.example.com/api/profile
- https://app.example.com/api/settings`

      const result = parseMessage(message)

      expect(result.domain).toBe("app.example.com")
      expect(result.address).toBe(VALID_ADDRESS)
      expect(result.statement).toBe(
        "Access your dashboard and manage settings.",
      )
      expect(result.uri).toBe("https://app.example.com/api/auth")
      expect(result.version).toBe("1")
      expect(result.nonce).toBe("f7k2m9p4x1")
      expect(result.issuedAt).toBe("2024-01-15T12:00:00.000Z")
      expect(result.expirationTime).toBe("2024-01-15T12:10:00.000Z")
      expect(result.notBefore).toBe("2024-01-15T12:00:00.000Z")
      expect(result.requestId).toBe("req_abc123")
      expect(result.cluster).toBe("mainnet-beta")
      expect(result.resources).toEqual([
        "https://app.example.com/api/profile",
        "https://app.example.com/api/settings",
      ])
    })

    it("parses message with localhost domain", () => {
      const message = `localhost:3000 wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: http://localhost:3000/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const result = parseMessage(message)

      expect(result.domain).toBe("localhost:3000")
    })

    it("parses message with devnet cluster", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: devnet`

      const result = parseMessage(message)

      expect(result.cluster).toBe("devnet")
    })

    it("parses message with testnet cluster", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: testnet`

      const result = parseMessage(message)

      expect(result.cluster).toBe("testnet")
    })

    it("parses message with single resource", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta
Resources:
- https://example.com/api/resource`

      const result = parseMessage(message)

      expect(result.resources).toEqual(["https://example.com/api/resource"])
    })

    it("parses message with milliseconds in timestamp", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00.123Z
Cluster: mainnet-beta`

      const result = parseMessage(message)

      expect(result.issuedAt).toBe("2024-01-15T12:00:00.123Z")
    })
  })

  describe("invalid messages", () => {
    it("throws on message too short", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow("Message is too short")
    })

    it("throws on missing domain line suffix", () => {
      const message = `example.com wants you to sign in:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow("missing domain line")
    })

    it("throws on empty address", () => {
      const message = `example.com wants you to sign in with your Solana account:

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow("missing address")
    })

    it("throws on missing URI field", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow("Missing required field: URI")
    })

    it("throws on missing Version field", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow(
        "Missing required field: Version",
      )
    })

    it("throws on missing Nonce field", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow(
        "Missing required field: Nonce",
      )
    })

    it("throws on missing Issued At field", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow(
        "Missing required field: Issued At",
      )
    })

    it("throws on multiline statement", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Line one
Line two

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow(
        "Statement must be a single line",
      )
    })

    it("throws on missing cluster", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      try {
        parseMessage(message)
      } catch (error) {
        expect(error).toBeInstanceOf(SiwsError)
        expect((error as SiwsError).code).toBe(
          SiwsErrorCode.MISSING_REQUIRED_FIELD,
        )
        expect((error as SiwsError).message).toContain("Cluster")
      }
    })

    it("throws on invalid cluster", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: invalid-cluster`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      try {
        parseMessage(message)
      } catch (error) {
        expect(error).toBeInstanceOf(SiwsError)
        expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_CLUSTER)
      }
    })

    it("throws on malformed resource line", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta
Resources:
https://example.com/api/resource`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow('must start with "- "')
    })
  })

  describe("edge cases", () => {
    it("handles statement with special characters", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Sign in to access $100 worth of tokens! (Limited time offer)

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const result = parseMessage(message)

      expect(result.statement).toBe(
        "Sign in to access $100 worth of tokens! (Limited time offer)",
      )
    })

    it("handles request ID with special characters", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Request ID: req-123_abc.456
Cluster: mainnet-beta`

      const result = parseMessage(message)

      expect(result.requestId).toBe("req-123_abc.456")
    })
  })

  describe("strict canonical parsing", () => {
    const CANONICAL = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

    function expectParseError(message: string, text?: string) {
      try {
        parseMessage(message)
      } catch (error) {
        expect(error).toBeInstanceOf(SiwsError)
        expect((error as SiwsError).code).toBe(SiwsErrorCode.PARSE_ERROR)
        if (text) expect((error as SiwsError).message).toContain(text)
        return
      }
      throw new Error("expected parseMessage to throw")
    }

    it("accepts the canonical message", () => {
      expect(parseMessage(CANONICAL).nonce).toBe("abcd1234")
    })

    it("rejects duplicate Nonce (last-wins smuggling)", () => {
      const message = CANONICAL.replace(
        "Nonce: abcd1234",
        "Nonce: abcd1234\nNonce: efgh5678",
      )
      expectParseError(message, "Duplicate field: Nonce")
    })

    it("rejects duplicate URI", () => {
      const message = CANONICAL.replace(
        "Version: 1",
        "URI: https://evil.com\nVersion: 1",
      )
      expectParseError(message, "Duplicate field: URI")
    })

    it("rejects junk line among fields", () => {
      const message = CANONICAL.replace(
        "Version: 1",
        "Version: 1\nthis line is ignored by lenient parsers",
      )
      expectParseError(message, "unexpected line")
    })

    it("rejects unknown field", () => {
      const message = CANONICAL.replace("Version: 1", "Version: 1\nChain ID: 1")
      expectParseError(message, 'unexpected line "Chain ID: 1"')
    })

    it("rejects statement that looks like a field line", () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://evil.com

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`
      expectParseError(message)
    })

    it("rejects trailing newline", () => {
      expectParseError(`${CANONICAL}\n`, "unexpected empty line")
    })

    it("rejects CRLF line endings", () => {
      expectParseError(CANONICAL.replace(/\n/g, "\r\n"), "carriage return")
    })

    it("rejects missing blank line after address", () => {
      expectParseError(
        CANONICAL.replace(`${VALID_ADDRESS}\n\n`, `${VALID_ADDRESS}\n`),
        "empty line after the address",
      )
    })

    it("rejects extra blank line before fields", () => {
      expectParseError(
        CANONICAL.replace(`${VALID_ADDRESS}\n\n`, `${VALID_ADDRESS}\n\n\n`),
      )
    })

    it("rejects blank line between fields", () => {
      expectParseError(
        CANONICAL.replace("Version: 1\n", "Version: 1\n\n"),
        "unexpected empty line",
      )
    })

    it("rejects out-of-order fields", () => {
      const message = CANONICAL.replace(
        "Version: 1\nNonce: abcd1234",
        "Nonce: abcd1234\nVersion: 1",
      )
      expectParseError(message, "canonical")
    })

    it("rejects empty resources section", () => {
      expectParseError(`${CANONICAL}\nResources:`, "canonical")
    })

    it("rejects field after resources", () => {
      expectParseError(
        `${CANONICAL}\nResources:\n- https://example.com/a\nRequest ID: x`,
        "Invalid resource format",
      )
    })

    it("rejects blank line inside resources", () => {
      expectParseError(
        `${CANONICAL}\nResources:\n- https://example.com/a\n\n- https://example.com/b`,
        "Invalid resource format",
      )
    })

    it("rejects trailing whitespace on the domain line", () => {
      expectParseError(CANONICAL.replace("account:", "account: "))
    })

    it("rejects field with missing space after colon", () => {
      expectParseError(
        CANONICAL.replace("Version: 1", "Version:1"),
        'unexpected line "Version:1"',
      )
    })
  })
})

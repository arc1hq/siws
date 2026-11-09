import { describe, it, expect } from "vitest"
import { SiwsMessage, SiwsMessageBuilder } from "@/message"
import { SiwsError, SiwsErrorCode } from "@/errors"

const VALID_ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"

describe("SiwsMessage", () => {
  describe("constructor", () => {
    it("creates message with required fields", () => {
      const message = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
      })

      expect(message.domain).toBe("example.com")
      expect(message.address).toBe(VALID_ADDRESS)
      expect(message.uri).toBe("https://example.com/auth")
      expect(message.version).toBe("1")
      expect(message.nonce).toBe("abcd1234")
      expect(message.issuedAt).toBe("2024-01-15T12:00:00Z")
      expect(message.cluster).toBe("mainnet-beta")
    })

    it("creates message with all fields", () => {
      const message = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        statement: "Sign in to Example",
        expirationTime: "2024-01-15T12:10:00Z",
        notBefore: "2024-01-15T12:00:00Z",
        requestId: "req_123",
        resources: ["https://example.com/api"],
      })

      expect(message.statement).toBe("Sign in to Example")
      expect(message.expirationTime).toBe("2024-01-15T12:10:00Z")
      expect(message.notBefore).toBe("2024-01-15T12:00:00Z")
      expect(message.requestId).toBe("req_123")
      expect(message.cluster).toBe("mainnet-beta")
      expect(message.resources).toEqual(["https://example.com/api"])
    })

    it("creates defensive copy of resources array", () => {
      const resources = ["https://example.com/api"]
      const message = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        resources,
      })

      resources.push("https://example.com/other")
      expect(message.resources).toEqual(["https://example.com/api"])
    })

    it("throws on invalid domain", () => {
      expect(
        () =>
          new SiwsMessage({
            domain: "",
            address: VALID_ADDRESS,
            uri: "https://example.com/auth",
            version: "1",
            nonce: "abcd1234",
            issuedAt: "2024-01-15T12:00:00Z",
            cluster: "mainnet-beta",
          }),
      ).toThrow(SiwsError)
    })

    it("throws on invalid address", () => {
      expect(
        () =>
          new SiwsMessage({
            domain: "example.com",
            address: "invalid",
            uri: "https://example.com/auth",
            version: "1",
            nonce: "abcd1234",
            issuedAt: "2024-01-15T12:00:00Z",
            cluster: "mainnet-beta",
          }),
      ).toThrow(SiwsError)
    })
  })

  describe("parse", () => {
    it("parses valid message string", () => {
      const messageString = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Sign in to Example

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`

      const message = SiwsMessage.parse(messageString)

      expect(message.domain).toBe("example.com")
      expect(message.address).toBe(VALID_ADDRESS)
      expect(message.statement).toBe("Sign in to Example")
    })

    it.each(["Version: 2 of MyApp", "URI: see below", "Resources:"])(
      "refuses to build a statement the parser would reject (%s)",
      (statement) => {
        const builder = new SiwsMessageBuilder()
          .domain("example.com")
          .address(VALID_ADDRESS)
          .uri("https://example.com/auth")
          .nonce("abcd1234")
          .issuedAt("2024-01-15T12:00:00Z")
          .cluster("mainnet-beta")
          .statement(statement)

        expect(() => builder.build()).toThrow(
          expect.objectContaining({ code: SiwsErrorCode.INVALID_STATEMENT }),
        )
      },
    )

    it("throws on invalid message string", () => {
      expect(() => SiwsMessage.parse("invalid message")).toThrow(SiwsError)
    })

    it("only accepts input equal to its own toMessage()", () => {
      const canonical = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        statement: "Sign in to Example",
        resources: ["https://example.com/api"],
      }).toMessage()

      expect(SiwsMessage.parse(canonical).toMessage()).toBe(canonical)

      for (const variant of [
        `${canonical}\n`,
        canonical.replace(/\n/g, "\r\n"),
        canonical.replace(
          "Nonce: abcd1234",
          "Nonce: abcd1234\nNonce: efgh5678",
        ),
        canonical.replace("Version: 1", "Version: 1\njunk"),
      ]) {
        try {
          SiwsMessage.parse(variant)
          throw new Error(
            `accepted non-canonical input: ${JSON.stringify(variant)}`,
          )
        } catch (error) {
          expect(error).toBeInstanceOf(SiwsError)
          expect((error as SiwsError).code).toBe(SiwsErrorCode.PARSE_ERROR)
        }
      }
    })
  })

  describe("toMessage", () => {
    it("serializes minimal message without statement", () => {
      const message = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
      })

      const result = message.toMessage()

      expect(result)
        .toBe(`example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`)
    })

    it("serializes message with statement", () => {
      const message = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        statement: "Sign in to Example",
      })

      const result = message.toMessage()

      expect(result).toContain("Sign in to Example")
      expect(result)
        .toBe(`example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Sign in to Example

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: mainnet-beta`)
    })

    it("serializes message with all fields", () => {
      const message = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        statement: "Sign in to Example",
        expirationTime: "2024-01-15T12:10:00Z",
        notBefore: "2024-01-15T12:00:00Z",
        requestId: "req_123",
        resources: ["https://example.com/api/a", "https://example.com/api/b"],
      })

      const result = message.toMessage()

      expect(result).toContain("Expiration Time: 2024-01-15T12:10:00Z")
      expect(result).toContain("Not Before: 2024-01-15T12:00:00Z")
      expect(result).toContain("Request ID: req_123")
      expect(result).toContain("Cluster: mainnet-beta")
      expect(result).toContain("Resources:")
      expect(result).toContain("- https://example.com/api/a")
      expect(result).toContain("- https://example.com/api/b")
    })

    it("roundtrips parse -> toMessage -> parse", () => {
      const original = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        statement: "Sign in to Example",
        expirationTime: "2024-01-15T12:10:00Z",
        resources: ["https://example.com/api"],
      })

      const serialized = original.toMessage()
      const parsed = SiwsMessage.parse(serialized)

      expect(parsed.domain).toBe(original.domain)
      expect(parsed.address).toBe(original.address)
      expect(parsed.uri).toBe(original.uri)
      expect(parsed.version).toBe(original.version)
      expect(parsed.nonce).toBe(original.nonce)
      expect(parsed.issuedAt).toBe(original.issuedAt)
      expect(parsed.statement).toBe(original.statement)
      expect(parsed.expirationTime).toBe(original.expirationTime)
      expect(parsed.cluster).toBe(original.cluster)
      expect(parsed.resources).toEqual(original.resources)
    })

    it("roundtrips message without statement", () => {
      const original = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
      })

      const serialized = original.toMessage()
      const parsed = SiwsMessage.parse(serialized)

      expect(parsed.domain).toBe(original.domain)
      expect(parsed.statement).toBeUndefined()
    })
  })

  describe("toFields", () => {
    it("returns all fields", () => {
      const message = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        statement: "Sign in",
        resources: ["https://example.com/api"],
      })

      const fields = message.toFields()

      expect(fields).toEqual({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        statement: "Sign in",
        expirationTime: undefined,
        notBefore: undefined,
        requestId: undefined,
        resources: ["https://example.com/api"],
      })
    })

    it("creates defensive copy of resources", () => {
      const message = new SiwsMessage({
        domain: "example.com",
        address: VALID_ADDRESS,
        uri: "https://example.com/auth",
        version: "1",
        nonce: "abcd1234",
        issuedAt: "2024-01-15T12:00:00Z",
        cluster: "mainnet-beta",
        resources: ["https://example.com/api"],
      })

      const fields = message.toFields()
      fields.resources!.push("https://example.com/other")

      expect(message.resources).toEqual(["https://example.com/api"])
    })
  })
})

describe("SiwsMessageBuilder", () => {
  describe("build", () => {
    it("builds message with all required fields", () => {
      const message = new SiwsMessageBuilder()
        .domain("example.com")
        .address(VALID_ADDRESS)
        .uri("https://example.com/auth")
        .nonce("abcd1234")
        .issuedAt("2024-01-15T12:00:00Z")
        .cluster("mainnet-beta")
        .build()

      expect(message.domain).toBe("example.com")
      expect(message.address).toBe(VALID_ADDRESS)
      expect(message.uri).toBe("https://example.com/auth")
      expect(message.version).toBe("1")
      expect(message.nonce).toBe("abcd1234")
      expect(message.issuedAt).toBe("2024-01-15T12:00:00Z")
      expect(message.cluster).toBe("mainnet-beta")
    })

    it("builds message with all optional fields", () => {
      const message = new SiwsMessageBuilder()
        .domain("example.com")
        .address(VALID_ADDRESS)
        .uri("https://example.com/auth")
        .nonce("abcd1234")
        .issuedAt("2024-01-15T12:00:00Z")
        .cluster("mainnet-beta")
        .statement("Sign in to Example")
        .expirationTime("2024-01-15T12:10:00Z")
        .notBefore("2024-01-15T12:00:00Z")
        .requestId("req_123")
        .cluster("mainnet-beta")
        .resources(["https://example.com/api"])
        .build()

      expect(message.statement).toBe("Sign in to Example")
      expect(message.expirationTime).toBe("2024-01-15T12:10:00Z")
      expect(message.notBefore).toBe("2024-01-15T12:00:00Z")
      expect(message.requestId).toBe("req_123")
      expect(message.cluster).toBe("mainnet-beta")
      expect(message.resources).toEqual(["https://example.com/api"])
    })

    it("accepts Date for issuedAt", () => {
      const date = new Date("2024-01-15T12:00:00Z")
      const message = new SiwsMessageBuilder()
        .domain("example.com")
        .address(VALID_ADDRESS)
        .uri("https://example.com/auth")
        .nonce("abcd1234")
        .issuedAt(date)
        .cluster("mainnet-beta")
        .build()

      expect(message.issuedAt).toBe("2024-01-15T12:00:00.000Z")
    })

    it("accepts Date for expirationTime", () => {
      const date = new Date("2024-01-15T12:10:00Z")
      const message = new SiwsMessageBuilder()
        .domain("example.com")
        .address(VALID_ADDRESS)
        .uri("https://example.com/auth")
        .nonce("abcd1234")
        .issuedAt("2024-01-15T12:00:00Z")
        .cluster("mainnet-beta")
        .expirationTime(date)
        .build()

      expect(message.expirationTime).toBe("2024-01-15T12:10:00.000Z")
    })

    it("accepts Date for notBefore", () => {
      const date = new Date("2024-01-15T12:00:00Z")
      const message = new SiwsMessageBuilder()
        .domain("example.com")
        .address(VALID_ADDRESS)
        .uri("https://example.com/auth")
        .nonce("abcd1234")
        .issuedAt("2024-01-15T12:00:00Z")
        .cluster("mainnet-beta")
        .notBefore(date)
        .build()

      expect(message.notBefore).toBe("2024-01-15T12:00:00.000Z")
    })

    it("supports addResource for incremental building", () => {
      const message = new SiwsMessageBuilder()
        .domain("example.com")
        .address(VALID_ADDRESS)
        .uri("https://example.com/auth")
        .nonce("abcd1234")
        .issuedAt("2024-01-15T12:00:00Z")
        .cluster("mainnet-beta")
        .addResource("https://example.com/api/a")
        .addResource("https://example.com/api/b")
        .build()

      expect(message.resources).toEqual([
        "https://example.com/api/a",
        "https://example.com/api/b",
      ])
    })

    it("supports method chaining", () => {
      const builder = new SiwsMessageBuilder()

      const result = builder
        .domain("example.com")
        .address(VALID_ADDRESS)
        .uri("https://example.com/auth")
        .nonce("abcd1234")
        .issuedAt("2024-01-15T12:00:00Z")
        .cluster("mainnet-beta")

      expect(result).toBe(builder)
    })
  })

  describe("validation errors", () => {
    it("throws when domain is missing", () => {
      expect(() =>
        new SiwsMessageBuilder()
          .address(VALID_ADDRESS)
          .uri("https://example.com/auth")
          .nonce("abcd1234")
          .issuedAt("2024-01-15T12:00:00Z")
          .cluster("mainnet-beta")
          .build(),
      ).toThrow(SiwsError)

      try {
        new SiwsMessageBuilder()
          .address(VALID_ADDRESS)
          .uri("https://example.com/auth")
          .nonce("abcd1234")
          .issuedAt("2024-01-15T12:00:00Z")
          .cluster("mainnet-beta")
          .build()
      } catch (error) {
        expect((error as SiwsError).code).toBe(
          SiwsErrorCode.MISSING_REQUIRED_FIELD,
        )
        expect((error as SiwsError).message).toContain("domain")
      }
    })

    it("throws when address is missing", () => {
      expect(() =>
        new SiwsMessageBuilder()
          .domain("example.com")
          .uri("https://example.com/auth")
          .nonce("abcd1234")
          .issuedAt("2024-01-15T12:00:00Z")
          .cluster("mainnet-beta")
          .build(),
      ).toThrow(SiwsError)
    })

    it("throws when uri is missing", () => {
      expect(() =>
        new SiwsMessageBuilder()
          .domain("example.com")
          .address(VALID_ADDRESS)
          .nonce("abcd1234")
          .issuedAt("2024-01-15T12:00:00Z")
          .cluster("mainnet-beta")
          .build(),
      ).toThrow(SiwsError)
    })

    it("throws when nonce is missing", () => {
      expect(() =>
        new SiwsMessageBuilder()
          .domain("example.com")
          .address(VALID_ADDRESS)
          .uri("https://example.com/auth")
          .issuedAt("2024-01-15T12:00:00Z")
          .cluster("mainnet-beta")
          .build(),
      ).toThrow(SiwsError)
    })

    it("throws when issuedAt is missing", () => {
      expect(() =>
        new SiwsMessageBuilder()
          .domain("example.com")
          .address(VALID_ADDRESS)
          .uri("https://example.com/auth")
          .nonce("abcd1234")
          .cluster("mainnet-beta")
          .build(),
      ).toThrow(SiwsError)
    })

    it("throws when cluster is missing", () => {
      expect(() =>
        new SiwsMessageBuilder()
          .domain("example.com")
          .address(VALID_ADDRESS)
          .uri("https://example.com/auth")
          .nonce("abcd1234")
          .issuedAt("2024-01-15T12:00:00Z")
          .build(),
      ).toThrow(SiwsError)

      try {
        new SiwsMessageBuilder()
          .domain("example.com")
          .address(VALID_ADDRESS)
          .uri("https://example.com/auth")
          .nonce("abcd1234")
          .issuedAt("2024-01-15T12:00:00Z")
          .build()
      } catch (error) {
        expect((error as SiwsError).code).toBe(
          SiwsErrorCode.MISSING_REQUIRED_FIELD,
        )
        expect((error as SiwsError).message).toContain("cluster")
      }
    })

    it("lists all missing fields in error", () => {
      try {
        new SiwsMessageBuilder().build()
      } catch (error) {
        const message = (error as SiwsError).message
        expect(message).toContain("domain")
        expect(message).toContain("address")
        expect(message).toContain("uri")
        expect(message).toContain("nonce")
        expect(message).toContain("issuedAt")
        expect(message).toContain("cluster")
      }
    })

    it("validates fields on build", () => {
      expect(() =>
        new SiwsMessageBuilder()
          .domain("example.com")
          .address("invalid-address")
          .uri("https://example.com/auth")
          .nonce("abcd1234")
          .issuedAt("2024-01-15T12:00:00Z")
          .cluster("mainnet-beta")
          .build(),
      ).toThrow(SiwsError)
    })
  })
})

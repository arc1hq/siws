import { describe, it, expect } from "vitest"
import {
  validateDomain,
  validateAddress,
  validateUri,
  validateVersion,
  validateNonce,
  validateTimestamp,
  validateStatement,
  validateRequestId,
  validateCluster,
  validateResource,
  validateAllFields,
} from "@/validator"
import { SiwsError, SiwsErrorCode } from "@/errors"
import type { Cluster, SiwsMessageFields } from "@/types"

const VALID_ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"

describe("validateDomain", () => {
  it("accepts valid domain", () => {
    expect(() => validateDomain("example.com")).not.toThrow()
  })

  it("accepts domain with subdomain", () => {
    expect(() => validateDomain("app.example.com")).not.toThrow()
  })

  it("accepts domain with port", () => {
    expect(() => validateDomain("example.com:3000")).not.toThrow()
  })

  it("accepts localhost", () => {
    expect(() => validateDomain("localhost")).not.toThrow()
  })

  it("accepts localhost with port", () => {
    expect(() => validateDomain("localhost:3000")).not.toThrow()
  })

  it("accepts deeply nested subdomain", () => {
    expect(() => validateDomain("a.b.c.example.com")).not.toThrow()
  })

  it("rejects empty domain", () => {
    expect(() => validateDomain("")).toThrow(SiwsError)
  })

  it("rejects domain with scheme", () => {
    expect(() => validateDomain("https://example.com")).toThrow(SiwsError)
  })

  it("rejects domain with path", () => {
    expect(() => validateDomain("example.com/path")).toThrow(SiwsError)
  })

  it("rejects domain with invalid characters", () => {
    expect(() => validateDomain("example_site.com")).toThrow(SiwsError)
  })

  it("throws with correct error code", () => {
    try {
      validateDomain("")
    } catch (error) {
      expect(error).toBeInstanceOf(SiwsError)
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_DOMAIN)
    }
  })
})

describe("validateAddress", () => {
  it("accepts valid 44-character address", () => {
    expect(() => validateAddress(VALID_ADDRESS)).not.toThrow()
  })

  it("accepts valid 43-character address", () => {
    expect(() =>
      validateAddress("YYDdiB94xbsiMwRmrziWFzUWcpGntJZfX5nA1kDKTwM"),
    ).not.toThrow()
  })

  it("accepts 32-byte key with short encoding (leading zero bytes)", () => {
    expect(() =>
      validateAddress("11111111111111111111111111111112"),
    ).not.toThrow()
  })

  it("rejects Base58 string that does not decode to 32 bytes", () => {
    // 43 valid Base58 characters, but decodes to 31 bytes
    expect(() =>
      validateAddress("2xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAs"),
    ).toThrow(SiwsError)
  })

  it("rejects empty address", () => {
    expect(() => validateAddress("")).toThrow(SiwsError)
    try {
      validateAddress("")
    } catch (error) {
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_ADDRESS)
    }
  })

  it("rejects address too short", () => {
    expect(() =>
      validateAddress("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosg"),
    ).toThrow(SiwsError)
  })

  it("rejects address too long", () => {
    expect(() =>
      validateAddress("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsUX"),
    ).toThrow(SiwsError)
  })

  it("rejects address with invalid Base58 characters (0)", () => {
    expect(() =>
      validateAddress("0xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
    ).toThrow(SiwsError)
  })

  it("rejects address with invalid Base58 characters (O)", () => {
    expect(() =>
      validateAddress("OxKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
    ).toThrow(SiwsError)
  })

  it("rejects address with invalid Base58 characters (I)", () => {
    expect(() =>
      validateAddress("IxKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
    ).toThrow(SiwsError)
  })

  it("rejects address with invalid Base58 characters (l)", () => {
    expect(() =>
      validateAddress("lxKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"),
    ).toThrow(SiwsError)
  })

  it("throws with correct error code", () => {
    try {
      validateAddress("invalid")
    } catch (error) {
      expect(error).toBeInstanceOf(SiwsError)
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_ADDRESS)
    }
  })
})

describe("validateUri", () => {
  it("accepts valid HTTPS URI", () => {
    expect(() => validateUri("https://example.com/auth")).not.toThrow()
  })

  it("accepts valid HTTP URI", () => {
    expect(() => validateUri("http://localhost:3000/auth")).not.toThrow()
  })

  it("accepts URI with query string", () => {
    expect(() => validateUri("https://example.com/auth?foo=bar")).not.toThrow()
  })

  it("accepts URI with fragment", () => {
    expect(() => validateUri("https://example.com/auth#section")).not.toThrow()
  })

  it("accepts custom scheme URI", () => {
    expect(() => validateUri("solana:pay/transfer")).not.toThrow()
  })

  it("rejects empty URI", () => {
    expect(() => validateUri("")).toThrow(SiwsError)
  })

  it("rejects URI without scheme", () => {
    expect(() => validateUri("example.com/auth")).toThrow(SiwsError)
  })

  it("rejects URI with invalid scheme start", () => {
    expect(() => validateUri("123://example.com")).toThrow(SiwsError)
  })

  it("throws with correct error code", () => {
    try {
      validateUri("")
    } catch (error) {
      expect(error).toBeInstanceOf(SiwsError)
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_URI)
    }
  })
})

describe("validateVersion", () => {
  it("accepts version 1", () => {
    expect(() => validateVersion("1")).not.toThrow()
  })

  it("rejects version 2", () => {
    expect(() => validateVersion("2")).toThrow(SiwsError)
  })

  it("rejects empty version", () => {
    expect(() => validateVersion("")).toThrow(SiwsError)
  })

  it("rejects version 1.0", () => {
    expect(() => validateVersion("1.0")).toThrow(SiwsError)
  })

  it("throws with expected and received values", () => {
    try {
      validateVersion("2")
    } catch (error) {
      expect(error).toBeInstanceOf(SiwsError)
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_VERSION)
      expect((error as SiwsError).expected).toBe("1")
      expect((error as SiwsError).received).toBe("2")
    }
  })
})

describe("validateNonce", () => {
  it("accepts valid 8-character nonce", () => {
    expect(() => validateNonce("abcd1234")).not.toThrow()
  })

  it("accepts valid 16-character nonce", () => {
    expect(() => validateNonce("abcd1234efgh5678")).not.toThrow()
  })

  it("accepts alphanumeric nonce", () => {
    expect(() => validateNonce("ABC123xyz")).not.toThrow()
  })

  it("rejects empty nonce", () => {
    expect(() => validateNonce("")).toThrow(SiwsError)
  })

  it("rejects nonce shorter than 8 characters", () => {
    expect(() => validateNonce("abc1234")).toThrow(SiwsError)
  })

  it("rejects nonce with special characters", () => {
    expect(() => validateNonce("abcd-1234")).toThrow(SiwsError)
  })

  it("rejects nonce with spaces", () => {
    expect(() => validateNonce("abcd 1234")).toThrow(SiwsError)
  })

  it("throws with correct error code", () => {
    try {
      validateNonce("short")
    } catch (error) {
      expect(error).toBeInstanceOf(SiwsError)
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_NONCE)
    }
  })
})

describe("validateTimestamp", () => {
  it("accepts valid ISO 8601 timestamp", () => {
    expect(() => validateTimestamp("2024-01-15T12:00:00Z")).not.toThrow()
  })

  it("accepts timestamp with milliseconds", () => {
    expect(() => validateTimestamp("2024-01-15T12:00:00.123Z")).not.toThrow()
  })

  it("accepts timestamp with single digit milliseconds", () => {
    expect(() => validateTimestamp("2024-01-15T12:00:00.1Z")).not.toThrow()
  })

  it("rejects empty timestamp", () => {
    expect(() => validateTimestamp("")).toThrow(SiwsError)
  })

  it("rejects timestamp without Z suffix", () => {
    expect(() => validateTimestamp("2024-01-15T12:00:00")).toThrow(SiwsError)
  })

  it("rejects timestamp with timezone offset", () => {
    expect(() => validateTimestamp("2024-01-15T12:00:00+00:00")).toThrow(
      SiwsError,
    )
  })

  it("rejects invalid date", () => {
    expect(() => validateTimestamp("2024-13-45T99:99:99Z")).toThrow(SiwsError)
  })

  it("rejects non-existent calendar date", () => {
    expect(() => validateTimestamp("2024-02-30T00:00:00Z")).toThrow(SiwsError)
  })

  it("rejects date-only format", () => {
    expect(() => validateTimestamp("2024-01-15")).toThrow(SiwsError)
  })

  it("throws with correct error code", () => {
    try {
      validateTimestamp("invalid")
    } catch (error) {
      expect(error).toBeInstanceOf(SiwsError)
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_TIMESTAMP)
    }
  })
})

describe("validateStatement", () => {
  it("accepts valid statement", () => {
    expect(() => validateStatement("Sign in to Example")).not.toThrow()
  })

  it("accepts statement with special characters", () => {
    expect(() =>
      validateStatement("Sign in to access $100! (Limited time)"),
    ).not.toThrow()
  })

  it("accepts statement with all printable ASCII", () => {
    expect(() =>
      validateStatement(
        " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
      ),
    ).not.toThrow()
  })

  it("rejects empty statement", () => {
    expect(() => validateStatement("")).toThrow(SiwsError)
  })

  it("rejects statement with newline", () => {
    expect(() => validateStatement("Line 1\nLine 2")).toThrow(SiwsError)
  })

  it("rejects statement with carriage return", () => {
    expect(() => validateStatement("Line 1\rLine 2")).toThrow(SiwsError)
  })

  it("rejects statement with tab", () => {
    expect(() => validateStatement("Text\twith\ttabs")).toThrow(SiwsError)
  })

  it("rejects statement with non-ASCII characters", () => {
    expect(() => validateStatement("Sign in to Éxample")).toThrow(SiwsError)
  })

  it("rejects statement with emoji", () => {
    expect(() => validateStatement("Sign in 🚀")).toThrow(SiwsError)
  })

  it("throws with correct error code", () => {
    try {
      validateStatement("")
    } catch (error) {
      expect(error).toBeInstanceOf(SiwsError)
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_STATEMENT)
    }
  })
})

describe("validateRequestId", () => {
  it("accepts valid request ID", () => {
    expect(() => validateRequestId("req_abc123")).not.toThrow()
  })

  it("accepts request ID with special characters", () => {
    expect(() => validateRequestId("req-123_abc.456")).not.toThrow()
  })

  it("rejects empty request ID", () => {
    expect(() => validateRequestId("")).toThrow(SiwsError)
  })

  it("rejects request ID with newline", () => {
    expect(() => validateRequestId("req\n123")).toThrow(SiwsError)
  })

  it("rejects request ID with non-ASCII", () => {
    expect(() => validateRequestId("req_éxample")).toThrow(SiwsError)
  })

  it("throws with correct error code", () => {
    try {
      validateRequestId("")
    } catch (error) {
      expect(error).toBeInstanceOf(SiwsError)
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_REQUEST_ID)
    }
  })
})

describe("validateCluster", () => {
  it("accepts mainnet-beta", () => {
    expect(() => validateCluster("mainnet-beta")).not.toThrow()
  })

  it("accepts devnet", () => {
    expect(() => validateCluster("devnet")).not.toThrow()
  })

  it("accepts testnet", () => {
    expect(() => validateCluster("testnet")).not.toThrow()
  })

  it("rejects invalid cluster", () => {
    expect(() => validateCluster("mainnet")).toThrow(SiwsError)
  })

  it("rejects empty cluster", () => {
    expect(() => validateCluster("")).toThrow(SiwsError)
  })

  it("throws with expected and received values", () => {
    try {
      validateCluster("invalid")
    } catch (error) {
      expect(error).toBeInstanceOf(SiwsError)
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_CLUSTER)
      expect((error as SiwsError).expected).toBe(
        "mainnet-beta | devnet | testnet",
      )
      expect((error as SiwsError).received).toBe("invalid")
    }
  })
})

describe("validateResource", () => {
  it("accepts valid HTTPS resource", () => {
    expect(() =>
      validateResource("https://example.com/api/resource"),
    ).not.toThrow()
  })

  it("accepts valid custom scheme resource", () => {
    expect(() => validateResource("ipfs:QmHash123")).not.toThrow()
  })

  it("rejects empty resource", () => {
    expect(() => validateResource("")).toThrow(SiwsError)
  })

  it("rejects resource without scheme", () => {
    expect(() => validateResource("example.com/resource")).toThrow(SiwsError)
  })

  it("throws with correct error code", () => {
    try {
      validateResource("")
    } catch (error) {
      expect(error).toBeInstanceOf(SiwsError)
      expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_RESOURCE)
    }
  })
})

describe("validateAllFields", () => {
  const validFields = {
    domain: "example.com",
    address: VALID_ADDRESS,
    uri: "https://example.com/auth",
    version: "1",
    nonce: "abcd1234",
    issuedAt: "2024-01-15T12:00:00Z",
    cluster: "mainnet-beta" as const,
  }

  it("accepts valid required fields only", () => {
    expect(() => validateAllFields(validFields)).not.toThrow()
  })

  it("accepts valid fields with all optional fields", () => {
    expect(() =>
      validateAllFields({
        ...validFields,
        statement: "Sign in to Example",
        expirationTime: "2024-01-15T12:10:00Z",
        notBefore: "2024-01-15T12:00:00Z",
        requestId: "req_123",
        cluster: "mainnet-beta",
        resources: ["https://example.com/api"],
      }),
    ).not.toThrow()
  })

  it("rejects invalid domain", () => {
    expect(() => validateAllFields({ ...validFields, domain: "" })).toThrow(
      SiwsError,
    )
  })

  it("rejects invalid address", () => {
    expect(() =>
      validateAllFields({ ...validFields, address: "invalid" }),
    ).toThrow(SiwsError)
  })

  it("rejects invalid uri", () => {
    expect(() =>
      validateAllFields({ ...validFields, uri: "not-a-uri" }),
    ).toThrow(SiwsError)
  })

  it("rejects invalid version", () => {
    expect(() => validateAllFields({ ...validFields, version: "2" })).toThrow(
      SiwsError,
    )
  })

  it("rejects invalid nonce", () => {
    expect(() => validateAllFields({ ...validFields, nonce: "short" })).toThrow(
      SiwsError,
    )
  })

  it("rejects invalid issuedAt", () => {
    expect(() =>
      validateAllFields({ ...validFields, issuedAt: "invalid" }),
    ).toThrow(SiwsError)
  })

  it("rejects invalid optional statement", () => {
    expect(() => validateAllFields({ ...validFields, statement: "" })).toThrow(
      SiwsError,
    )
  })

  it("rejects invalid optional expirationTime", () => {
    expect(() =>
      validateAllFields({ ...validFields, expirationTime: "invalid" }),
    ).toThrow(SiwsError)
  })

  it("rejects invalid optional notBefore", () => {
    expect(() =>
      validateAllFields({ ...validFields, notBefore: "invalid" }),
    ).toThrow(SiwsError)
  })

  it("rejects invalid optional requestId", () => {
    expect(() =>
      validateAllFields({ ...validFields, requestId: "req\n123" }),
    ).toThrow(SiwsError)
  })

  it("rejects missing cluster", () => {
    const fieldsWithoutCluster: Partial<SiwsMessageFields> = { ...validFields }
    delete fieldsWithoutCluster.cluster
    expect(() =>
      validateAllFields(fieldsWithoutCluster as SiwsMessageFields),
    ).toThrow(SiwsError)
  })

  it("rejects invalid cluster", () => {
    expect(() =>
      validateAllFields({ ...validFields, cluster: "invalid" as Cluster }),
    ).toThrow(SiwsError)
  })

  it("rejects invalid resource in array", () => {
    expect(() =>
      validateAllFields({ ...validFields, resources: ["not-a-uri"] }),
    ).toThrow(SiwsError)
  })

  it("validates all resources in array", () => {
    expect(() =>
      validateAllFields({
        ...validFields,
        resources: ["https://valid.com", "invalid-resource"],
      }),
    ).toThrow(SiwsError)
  })
})

import { describe, it, expect } from "vitest"
import {
  encodeBase58,
  decodeBase58,
  stringToBytes,
  bytesToString,
  generateNonce,
  isValidISO8601,
  parseISO8601,
  formatISO8601,
  isExpired,
  isNotYetValid,
} from "@/utils"
import { BASE58_ALPHABET, NONCE_MIN_LENGTH } from "@/constants"

describe("encodeBase58", () => {
  it("encodes empty array", () => {
    expect(encodeBase58(new Uint8Array([]))).toBe("")
  })

  it("encodes single zero byte", () => {
    expect(encodeBase58(new Uint8Array([0]))).toBe("1")
  })

  it("encodes known value", () => {
    const bytes = new Uint8Array([0, 1, 2, 3])
    const encoded = encodeBase58(bytes)
    expect(typeof encoded).toBe("string")
    expect(encoded.length).toBeGreaterThan(0)
  })

  it("roundtrips with decodeBase58", () => {
    const original = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
    const encoded = encodeBase58(original)
    const decoded = decodeBase58(encoded)
    expect(decoded).toEqual(original)
  })
})

describe("decodeBase58", () => {
  it("decodes empty string", () => {
    expect(decodeBase58("")).toEqual(new Uint8Array([]))
  })

  it("decodes single 1", () => {
    expect(decodeBase58("1")).toEqual(new Uint8Array([0]))
  })

  it("throws on invalid characters", () => {
    expect(() => decodeBase58("0OIl")).toThrow()
  })

  it("decodes valid Base58 string", () => {
    const encoded = "2NEpo7TZRRrLZSi2U"
    const decoded = decodeBase58(encoded)
    expect(decoded).toBeInstanceOf(Uint8Array)
  })
})

describe("stringToBytes", () => {
  it("converts empty string", () => {
    expect(stringToBytes("")).toEqual(new Uint8Array([]))
  })

  it("converts ASCII string", () => {
    const bytes = stringToBytes("hello")
    expect(bytes).toEqual(new Uint8Array([104, 101, 108, 108, 111]))
  })

  it("converts UTF-8 string", () => {
    const bytes = stringToBytes("hello 世界")
    expect(bytes.length).toBeGreaterThan(8)
  })

  it("roundtrips with bytesToString", () => {
    const original = "hello world"
    const bytes = stringToBytes(original)
    const result = bytesToString(bytes)
    expect(result).toBe(original)
  })
})

describe("bytesToString", () => {
  it("converts empty array", () => {
    expect(bytesToString(new Uint8Array([]))).toBe("")
  })

  it("converts ASCII bytes", () => {
    const bytes = new Uint8Array([104, 101, 108, 108, 111])
    expect(bytesToString(bytes)).toBe("hello")
  })
})

describe("generateNonce", () => {
  it("generates nonce of default length", () => {
    const nonce = generateNonce()
    expect(nonce.length).toBe(16)
  })

  it("generates nonce of specified length", () => {
    const nonce = generateNonce(32)
    expect(nonce.length).toBe(32)
  })

  it("generates nonce of minimum length", () => {
    const nonce = generateNonce(NONCE_MIN_LENGTH)
    expect(nonce.length).toBe(NONCE_MIN_LENGTH)
  })

  it("throws when length is below minimum", () => {
    expect(() => generateNonce(NONCE_MIN_LENGTH - 1)).toThrow()
    expect(() => generateNonce(0)).toThrow()
    expect(() => generateNonce(-1)).toThrow()
  })

  it("generates only Base58 characters", () => {
    const nonce = generateNonce(100)
    for (const char of nonce) {
      expect(BASE58_ALPHABET).toContain(char)
    }
  })

  it("generates unique nonces", () => {
    const nonces = new Set<string>()
    for (let i = 0; i < 100; i++) {
      nonces.add(generateNonce())
    }
    expect(nonces.size).toBe(100)
  })

  it("generates uniformly distributed characters", () => {
    const charCounts = new Map<string, number>()
    const iterations = 10000
    const nonceLength = 100

    for (let i = 0; i < iterations; i++) {
      const nonce = generateNonce(nonceLength)
      for (const char of nonce) {
        charCounts.set(char, (charCounts.get(char) || 0) + 1)
      }
    }

    const totalChars = iterations * nonceLength
    const expectedPerChar = totalChars / BASE58_ALPHABET.length
    const tolerance = expectedPerChar * 0.15

    for (const char of BASE58_ALPHABET) {
      const count = charCounts.get(char) || 0
      expect(count).toBeGreaterThan(expectedPerChar - tolerance)
      expect(count).toBeLessThan(expectedPerChar + tolerance)
    }
  })
})

describe("isValidISO8601", () => {
  it("accepts valid timestamp", () => {
    expect(isValidISO8601("2024-01-15T12:00:00Z")).toBe(true)
  })

  it("accepts timestamp with milliseconds", () => {
    expect(isValidISO8601("2024-01-15T12:00:00.123Z")).toBe(true)
  })

  it("accepts timestamp with single digit milliseconds", () => {
    expect(isValidISO8601("2024-01-15T12:00:00.1Z")).toBe(true)
  })

  it("rejects timestamp without Z suffix", () => {
    expect(isValidISO8601("2024-01-15T12:00:00")).toBe(false)
  })

  it("rejects timestamp with timezone offset", () => {
    expect(isValidISO8601("2024-01-15T12:00:00+00:00")).toBe(false)
  })

  it("rejects date only", () => {
    expect(isValidISO8601("2024-01-15")).toBe(false)
  })

  it("rejects empty string", () => {
    expect(isValidISO8601("")).toBe(false)
  })

  it("rejects invalid format", () => {
    expect(isValidISO8601("not a date")).toBe(false)
  })

  it("rejects invalid date values", () => {
    expect(isValidISO8601("2024-13-45T99:99:99Z")).toBe(false)
  })

  it("accepts leap year date", () => {
    expect(isValidISO8601("2024-02-29T12:00:00Z")).toBe(true)
  })
})

describe("parseISO8601", () => {
  it("parses valid timestamp", () => {
    const date = parseISO8601("2024-01-15T12:00:00Z")
    expect(date.getUTCFullYear()).toBe(2024)
    expect(date.getUTCMonth()).toBe(0)
    expect(date.getUTCDate()).toBe(15)
    expect(date.getUTCHours()).toBe(12)
    expect(date.getUTCMinutes()).toBe(0)
    expect(date.getUTCSeconds()).toBe(0)
  })

  it("parses timestamp with milliseconds", () => {
    const date = parseISO8601("2024-01-15T12:00:00.123Z")
    expect(date.getUTCMilliseconds()).toBe(123)
  })
})

describe("formatISO8601", () => {
  it("formats date to ISO 8601", () => {
    const date = new Date("2024-01-15T12:00:00Z")
    expect(formatISO8601(date)).toBe("2024-01-15T12:00:00.000Z")
  })

  it("includes milliseconds", () => {
    const date = new Date("2024-01-15T12:00:00.123Z")
    expect(formatISO8601(date)).toBe("2024-01-15T12:00:00.123Z")
  })

  it("roundtrips with parseISO8601", () => {
    const original = "2024-01-15T12:00:00.000Z"
    const date = parseISO8601(original)
    const formatted = formatISO8601(date)
    expect(formatted).toBe(original)
  })
})

describe("isExpired", () => {
  it("returns true when current time is after expiration", () => {
    const expiration = "2024-01-15T12:00:00Z"
    const now = new Date("2024-01-15T12:01:00Z")
    expect(isExpired(expiration, now)).toBe(true)
  })

  it("returns false when current time is before expiration", () => {
    const expiration = "2024-01-15T12:00:00Z"
    const now = new Date("2024-01-15T11:59:00Z")
    expect(isExpired(expiration, now)).toBe(false)
  })

  it("returns false when current time equals expiration", () => {
    const expiration = "2024-01-15T12:00:00Z"
    const now = new Date("2024-01-15T12:00:00Z")
    expect(isExpired(expiration, now)).toBe(false)
  })

  it("uses current time when now is not provided", () => {
    const pastExpiration = "2020-01-15T12:00:00Z"
    expect(isExpired(pastExpiration)).toBe(true)

    const futureExpiration = "2099-01-15T12:00:00Z"
    expect(isExpired(futureExpiration)).toBe(false)
  })
})

describe("isNotYetValid", () => {
  it("returns true when current time is before notBefore", () => {
    const notBefore = "2024-01-15T12:00:00Z"
    const now = new Date("2024-01-15T11:59:00Z")
    expect(isNotYetValid(notBefore, now)).toBe(true)
  })

  it("returns false when current time is after notBefore", () => {
    const notBefore = "2024-01-15T12:00:00Z"
    const now = new Date("2024-01-15T12:01:00Z")
    expect(isNotYetValid(notBefore, now)).toBe(false)
  })

  it("returns false when current time equals notBefore", () => {
    const notBefore = "2024-01-15T12:00:00Z"
    const now = new Date("2024-01-15T12:00:00Z")
    expect(isNotYetValid(notBefore, now)).toBe(false)
  })

  it("uses current time when now is not provided", () => {
    const pastNotBefore = "2020-01-15T12:00:00Z"
    expect(isNotYetValid(pastNotBefore)).toBe(false)

    const futureNotBefore = "2099-01-15T12:00:00Z"
    expect(isNotYetValid(futureNotBefore)).toBe(true)
  })
})

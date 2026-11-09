import { base58 } from "@scure/base"
import {
  BASE58_ALPHABET,
  DEFAULT_NONCE_LENGTH,
  NONCE_MIN_LENGTH,
  ISO8601_REGEX,
} from "@/constants"

export function encodeBase58(bytes: Uint8Array): string {
  return base58.encode(bytes)
}

export function decodeBase58(str: string): Uint8Array {
  return base58.decode(str)
}

export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

/**
 * Generate a cryptographically random Base58 nonce using
 * `crypto.getRandomValues` with rejection sampling (uniform over the
 * alphabet).
 *
 * @param length Number of characters; an integer >= 8. Defaults to 16.
 * @throws Error if `length` is not an integer or is below the minimum.
 */
export function generateNonce(length: number = DEFAULT_NONCE_LENGTH): string {
  if (!Number.isInteger(length) || length < NONCE_MIN_LENGTH) {
    throw new Error(
      `Nonce length must be an integer of at least ${NONCE_MIN_LENGTH}`,
    )
  }

  const result: string[] = []
  const alphabetLength = BASE58_ALPHABET.length
  const maxValid = 256 - (256 % alphabetLength)

  while (result.length < length) {
    const bytes = new Uint8Array(length - result.length)
    crypto.getRandomValues(bytes)
    for (const byte of bytes) {
      if (byte < maxValid && result.length < length) {
        result.push(BASE58_ALPHABET[byte % alphabetLength]!)
      }
    }
  }

  return result.join("")
}

/**
 * True if `dateStr` is a UTC ISO 8601 datetime (`YYYY-MM-DDTHH:mm:ss[.sss]Z`)
 * naming a real calendar instant. `Date` silently rolls over out-of-range
 * components (`2024-02-30` becomes `2024-03-01`, `T24:00:00` becomes the next
 * day), so the parsed components are compared back against the input.
 */
export function isValidISO8601(dateStr: string): boolean {
  if (!ISO8601_REGEX.test(dateStr)) {
    return false
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return false
  }
  // "YYYY-MM-DDTHH:mm:ss" (19 chars); milliseconds are 1-3 digits per the
  // regex and cannot overflow.
  return date.toISOString().slice(0, 19) === dateStr.slice(0, 19)
}

export function parseISO8601(dateStr: string): Date {
  return new Date(dateStr)
}

export function formatISO8601(date: Date): string {
  return date.toISOString()
}

/** True once `now` has reached `expirationTime` (the instant itself is expired). */
export function isExpired(expirationTime: string, now?: Date): boolean {
  const expiration = parseISO8601(expirationTime)
  const currentTime = now ?? new Date()
  return currentTime.getTime() >= expiration.getTime()
}

/** True while `now` is strictly before `notBefore`. */
export function isNotYetValid(notBefore: string, now?: Date): boolean {
  const validFrom = parseISO8601(notBefore)
  const currentTime = now ?? new Date()
  return currentTime.getTime() < validFrom.getTime()
}

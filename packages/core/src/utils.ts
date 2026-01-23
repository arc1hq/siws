import bs58 from 'bs58'
import { BASE58_ALPHABET, DEFAULT_NONCE_LENGTH, NONCE_MIN_LENGTH, ISO8601_REGEX } from '@/constants'

export function encodeBase58(bytes: Uint8Array): string {
  return bs58.encode(bytes)
}

export function decodeBase58(str: string): Uint8Array {
  return bs58.decode(str)
}

export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

export function generateNonce(length: number = DEFAULT_NONCE_LENGTH): string {
  if (length < NONCE_MIN_LENGTH) {
    throw new Error(`Nonce length must be at least ${NONCE_MIN_LENGTH}`)
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

  return result.join('')
}

export function isValidISO8601(dateStr: string): boolean {
  if (!ISO8601_REGEX.test(dateStr)) {
    return false
  }
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

export function parseISO8601(dateStr: string): Date {
  return new Date(dateStr)
}

export function formatISO8601(date: Date): string {
  return date.toISOString()
}

export function isExpired(expirationTime: string, now?: Date): boolean {
  const expiration = parseISO8601(expirationTime)
  const currentTime = now ?? new Date()
  return currentTime > expiration
}

export function isNotYetValid(notBefore: string, now?: Date): boolean {
  const validFrom = parseISO8601(notBefore)
  const currentTime = now ?? new Date()
  return currentTime < validFrom
}

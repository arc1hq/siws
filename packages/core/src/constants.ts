import type { Cluster } from "@/types"

export const SIWS_VERSION = "1"

export const SOLANA_ADDRESS_LENGTH = { min: 43, max: 44 }
export const SIGNATURE_BYTE_LENGTH = 64
export const PUBLIC_KEY_BYTE_LENGTH = 32
export const NONCE_MIN_LENGTH = 8
export const DEFAULT_NONCE_LENGTH = 16

export const CLUSTERS: readonly Cluster[] = [
  "mainnet-beta",
  "devnet",
  "testnet",
] as const

// ISO 8601 datetime with optional milliseconds and required Z suffix (e.g., 2024-01-15T12:00:00Z)
export const ISO8601_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/

// RFC 3986 authority: domain with optional port (e.g., example.com, localhost:3000)
export const DOMAIN_REGEX =
  /^(?:localhost|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)(?::\d+)?$/

// RFC 3986 URI: scheme followed by colon and non-whitespace (e.g., https://example.com)
export const URI_REGEX = /^[a-zA-Z][a-zA-Z0-9+.-]*:[^\s]+$/

// Alphanumeric nonce with minimum 8 characters
export const NONCE_REGEX = /^[a-zA-Z0-9]{8,}$/

export const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

// Base58 characters only (excludes 0, O, I, l to avoid ambiguity)
export const BASE58_CHAR_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/

// Printable ASCII range (space 0x20 to tilde 0x7E) for statement and requestId
export const PRINTABLE_ASCII_REGEX = /^[\x20-\x7E]+$/

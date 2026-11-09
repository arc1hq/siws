import type { SiwsError } from "@/errors"

/** Solana cluster a SIWS message is bound to. */
export type Cluster = "mainnet-beta" | "devnet" | "testnet"

/** Plain-object representation of every field in a SIWS message. */
export interface SiwsMessageFields {
  domain: string
  address: string
  uri: string
  version: string
  nonce: string
  issuedAt: string
  statement?: string
  expirationTime?: string
  notBefore?: string
  requestId?: string
  cluster: Cluster
  resources?: string[]
}

/**
 * Context checks applied by `verifySignature` in addition to the signature
 * itself.
 *
 * **Security:** `domain` and `nonce` are optional for flexibility, but a
 * relying party should almost always pass both:
 * - Omitting `domain` disables domain binding, so a signature produced for
 *   another site (phishing / cross-site replay) is accepted.
 * - Omitting `nonce` disables replay protection, so a previously captured
 *   message + signature can be reused until it expires.
 */
export interface VerificationOptions {
  /**
   * Expected `domain` (RFC 3986 authority, e.g. `example.com:3000`).
   * When omitted, the message domain is NOT checked.
   */
  domain?: string
  /**
   * Expected server-issued nonce. When omitted, the message nonce is NOT
   * checked and replay protection is disabled.
   */
  nonce?: string
  /** Reference time for `expirationTime` / `notBefore` checks. Defaults to now. */
  time?: Date
}

/**
 * Result of `verifySignature`. Discriminated on `success`, so
 * `if (result.success)` narrows `data` to `SiwsMessageFields` and the
 * `else` branch narrows `error` to `SiwsError`.
 */
export type VerificationResult =
  | { success: true; data: SiwsMessageFields; error?: undefined }
  | { success: false; error: SiwsError; data?: undefined }

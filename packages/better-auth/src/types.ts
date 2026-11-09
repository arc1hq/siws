import type { Cluster } from "@siws/core"
import type { InferOptionSchema } from "better-auth"
import type { schema } from "./schema"

export type { Cluster } from "@siws/core"

export interface SiwsOptions {
  /**
   * The RFC 3986 authority (host with optional port) that requests the
   * signature, e.g. `example.com` or `localhost:3000`. It is written into
   * every SIWS message and must match on verification.
   *
   * Never derived from request headers. Defaults to the host of the
   * better-auth base URL configured at startup (the static `baseURL` option
   * or the `BETTER_AUTH_URL` environment variable). A dynamic `baseURL`
   * config counts as not configured.
   */
  domain?: string

  /**
   * The RFC 3986 URI written into the SIWS message, e.g.
   * `https://example.com`.
   *
   * Defaults to the origin of the better-auth `baseURL`.
   */
  uri?: string

  /**
   * Optional statement to include in the SIWS message.
   * Displayed to users when signing.
   */
  statement?: string

  /**
   * Expiration time in seconds for the SIWS message.
   * @default 300 (5 minutes)
   */
  expirationTime?: number

  /**
   * Default Solana cluster.
   * @default 'mainnet-beta'
   */
  cluster?: Cluster

  /**
   * Optional resources to include in the SIWS message.
   */
  resources?: string[]

  /**
   * Domain name to use for synthetic email addresses when
   * creating users without an email.
   * @default 'siws.local'
   */
  emailDomainName?: string

  /**
   * Allow users to sign up without providing an email.
   * A synthetic email will be generated using the wallet address.
   * @default true
   */
  anonymous?: boolean

  /**
   * Custom schema options for the solanaAddress table.
   */
  schema?: InferOptionSchema<typeof schema>
}

/**
 * Represents a Solana address linked to a user.
 */
export interface SolanaAddress {
  id: string
  userId: string
  address: string
  cluster: Cluster
  isPrimary: boolean
  createdAt: Date
}

/**
 * Input for the nonce endpoint.
 */
export interface NonceInput {
  address: string
  cluster?: Cluster
}

/**
 * Response from the nonce endpoint.
 */
export interface NonceResponse {
  nonce: string
  message: string
}

/**
 * Input for the verify endpoint.
 */
export interface VerifyInput {
  message: string
  signature: string
  address: string
  cluster?: Cluster
  email?: string
}

/**
 * Response from the verify endpoint.
 */
export interface VerifyResponse {
  success: true
  token: string
  user: {
    id: string
    address: string
    cluster: Cluster
  }
}

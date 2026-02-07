import type { Cluster } from '@siws/core'
import type { InferOptionSchema } from 'better-auth'
import type { schema } from './schema'

export type { Cluster } from '@siws/core'

export interface SiwsOptions {
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
  success: boolean
  token?: string
  user?: {
    id: string
    address: string
    cluster: Cluster
  }
}

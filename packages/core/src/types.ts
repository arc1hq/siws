import type { SiwsError } from '@/errors'

export type Cluster = 'mainnet-beta' | 'devnet' | 'testnet'

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
  cluster?: Cluster
  resources?: string[]
}

export interface VerificationOptions {
  domain?: string
  nonce?: string
  time?: Date
}

export interface VerificationResult {
  success: boolean
  data?: SiwsMessageFields
  error?: SiwsError
}

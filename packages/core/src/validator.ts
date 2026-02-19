import { SiwsError, SiwsErrorCode } from '@/errors'
import {
  DOMAIN_REGEX,
  URI_REGEX,
  NONCE_REGEX,
  SOLANA_ADDRESS_LENGTH,
  BASE58_CHAR_REGEX,
  CLUSTERS,
  SIWS_VERSION,
  NONCE_MIN_LENGTH,
  PRINTABLE_ASCII_REGEX,
} from '@/constants'
import { isValidISO8601 } from '@/utils'
import type { Cluster, SiwsMessageFields } from '@/types'

export function validateDomain(domain: string): void {
  if (!domain || !DOMAIN_REGEX.test(domain)) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_DOMAIN,
      `Invalid domain: ${domain}`
    )
  }
}

export function validateAddress(address: string): void {
  if (!address) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_ADDRESS,
      'Address is required'
    )
  }

  const isValidLength =
    address.length >= SOLANA_ADDRESS_LENGTH.min &&
    address.length <= SOLANA_ADDRESS_LENGTH.max

  if (!isValidLength || !BASE58_CHAR_REGEX.test(address)) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_ADDRESS,
      `Invalid Solana address: ${address}`
    )
  }
}

export function validateUri(uri: string): void {
  if (!uri || !URI_REGEX.test(uri)) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_URI,
      `Invalid URI: ${uri}`
    )
  }
}

export function validateVersion(version: string): void {
  if (version !== SIWS_VERSION) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_VERSION,
      `Invalid version`,
      SIWS_VERSION,
      version
    )
  }
}

export function validateNonce(nonce: string): void {
  if (!nonce || nonce.length < NONCE_MIN_LENGTH || !NONCE_REGEX.test(nonce)) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_NONCE,
      `Invalid nonce: must be at least ${NONCE_MIN_LENGTH} alphanumeric characters`
    )
  }
}

export function validateTimestamp(timestamp: string): void {
  if (!timestamp || !isValidISO8601(timestamp)) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_TIMESTAMP,
      `Invalid timestamp: ${timestamp}`
    )
  }
}

export function validateStatement(statement: string): void {
  if (!statement || statement.length === 0) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_STATEMENT,
      'Statement must not be empty'
    )
  }
  if (!PRINTABLE_ASCII_REGEX.test(statement)) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_STATEMENT,
      'Statement must contain only printable ASCII characters (no newlines or control characters)'
    )
  }
}

export function validateRequestId(requestId: string): void {
  if (!requestId || !PRINTABLE_ASCII_REGEX.test(requestId)) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_REQUEST_ID,
      'Request ID must contain only printable ASCII characters'
    )
  }
}

export function validateCluster(cluster: string): asserts cluster is Cluster {
  if (!CLUSTERS.includes(cluster as Cluster)) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_CLUSTER,
      `Invalid cluster: ${cluster}`,
      CLUSTERS.join(' | '),
      cluster
    )
  }
}

export function validateResource(resource: string): void {
  if (!resource || !URI_REGEX.test(resource)) {
    throw new SiwsError(
      SiwsErrorCode.INVALID_RESOURCE,
      `Invalid resource URI: ${resource}`
    )
  }
}

export function validateAllFields(fields: SiwsMessageFields): void {
  validateDomain(fields.domain)
  validateAddress(fields.address)
  validateUri(fields.uri)
  validateVersion(fields.version)
  validateNonce(fields.nonce)
  validateTimestamp(fields.issuedAt)

  if (fields.statement !== undefined) {
    validateStatement(fields.statement)
  }
  if (fields.expirationTime !== undefined) {
    validateTimestamp(fields.expirationTime)
  }
  if (fields.notBefore !== undefined) {
    validateTimestamp(fields.notBefore)
  }
  if (fields.requestId !== undefined) {
    validateRequestId(fields.requestId)
  }
  validateCluster(fields.cluster)
  if (fields.resources !== undefined) {
    fields.resources.forEach(validateResource)
  }
}

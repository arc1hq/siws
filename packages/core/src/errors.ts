export enum SiwsErrorCode {
  INVALID_DOMAIN = "INVALID_DOMAIN",
  INVALID_ADDRESS = "INVALID_ADDRESS",
  INVALID_URI = "INVALID_URI",
  INVALID_VERSION = "INVALID_VERSION",
  INVALID_NONCE = "INVALID_NONCE",
  INVALID_TIMESTAMP = "INVALID_TIMESTAMP",
  INVALID_STATEMENT = "INVALID_STATEMENT",
  INVALID_CLUSTER = "INVALID_CLUSTER",
  INVALID_RESOURCE = "INVALID_RESOURCE",
  INVALID_SIGNATURE = "INVALID_SIGNATURE",
  INVALID_REQUEST_ID = "INVALID_REQUEST_ID",
  MESSAGE_EXPIRED = "MESSAGE_EXPIRED",
  MESSAGE_NOT_YET_VALID = "MESSAGE_NOT_YET_VALID",
  DOMAIN_MISMATCH = "DOMAIN_MISMATCH",
  NONCE_MISMATCH = "NONCE_MISMATCH",
  PARSE_ERROR = "PARSE_ERROR",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  SIGNATURE_VERIFICATION_FAILED = "SIGNATURE_VERIFICATION_FAILED",
}

export class SiwsError extends Error {
  readonly code: SiwsErrorCode
  readonly expected?: string
  readonly received?: string

  constructor(
    code: SiwsErrorCode,
    message: string,
    expected?: string,
    received?: string,
  ) {
    super(message)
    this.name = "SiwsError"
    this.code = code
    this.expected = expected
    this.received = received
  }
}

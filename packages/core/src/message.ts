import type { SiwsMessageFields, Cluster } from "@/types"
import { parseMessage } from "@/parser"
import { validateAllFields } from "@/validator"
import { SIWS_VERSION } from "@/constants"
import { formatISO8601 } from "@/utils"
import { serializeMessage } from "@/serializer"
import { SiwsError, SiwsErrorCode } from "@/errors"

/**
 * Immutable, validated SIWS message. All fields are validated on
 * construction; invalid input throws `SiwsError`.
 */
export class SiwsMessage {
  readonly domain: string
  readonly address: string
  readonly uri: string
  readonly version: string
  readonly nonce: string
  readonly issuedAt: string
  readonly statement?: string
  readonly expirationTime?: string
  readonly notBefore?: string
  readonly requestId?: string
  readonly cluster: Cluster
  readonly resources?: string[]

  constructor(fields: SiwsMessageFields) {
    validateAllFields(fields)

    this.domain = fields.domain
    this.address = fields.address
    this.uri = fields.uri
    this.version = fields.version
    this.nonce = fields.nonce
    this.issuedAt = fields.issuedAt
    this.statement = fields.statement
    this.expirationTime = fields.expirationTime
    this.notBefore = fields.notBefore
    this.requestId = fields.requestId
    this.cluster = fields.cluster
    this.resources = fields.resources ? [...fields.resources] : undefined
  }

  /**
   * Parse and validate a raw message string.
   *
   * Parsing is strict: the input must be in canonical form, i.e. exactly
   * equal to `toMessage()` of the result (LF line endings, fixed field order,
   * no duplicate/unknown lines, no extra blank lines or trailing newline).
   * Throws `SiwsError` (`PARSE_ERROR` for format problems, field-specific
   * codes for invalid values).
   */
  static parse(message: string): SiwsMessage {
    const fields = parseMessage(message)
    return new SiwsMessage(fields)
  }

  /**
   * Serialize to the canonical SIWS message string. These are the exact bytes
   * the wallet must sign (UTF-8, LF-separated, no trailing newline).
   */
  toMessage(): string {
    return serializeMessage(this)
  }

  /** Return all fields as a plain object (defensive copy). */
  toFields(): SiwsMessageFields {
    return {
      domain: this.domain,
      address: this.address,
      uri: this.uri,
      version: this.version,
      nonce: this.nonce,
      issuedAt: this.issuedAt,
      statement: this.statement,
      expirationTime: this.expirationTime,
      notBefore: this.notBefore,
      requestId: this.requestId,
      cluster: this.cluster,
      resources: this.resources ? [...this.resources] : undefined,
    }
  }
}

/**
 * Fluent builder for `SiwsMessage`. `version` defaults to `"1"`; timestamp
 * setters accept a `Date` or an ISO 8601 string. `build()` throws
 * `MISSING_REQUIRED_FIELD` if domain, address, uri, nonce, issuedAt or
 * cluster is unset, and otherwise validates like the `SiwsMessage`
 * constructor.
 */
export class SiwsMessageBuilder {
  private fields: Partial<SiwsMessageFields> = {
    version: SIWS_VERSION,
  }

  domain(domain: string): this {
    this.fields.domain = domain
    return this
  }

  address(address: string): this {
    this.fields.address = address
    return this
  }

  uri(uri: string): this {
    this.fields.uri = uri
    return this
  }

  nonce(nonce: string): this {
    this.fields.nonce = nonce
    return this
  }

  issuedAt(issuedAt: string | Date): this {
    this.fields.issuedAt =
      issuedAt instanceof Date ? formatISO8601(issuedAt) : issuedAt
    return this
  }

  statement(statement: string): this {
    this.fields.statement = statement
    return this
  }

  expirationTime(expirationTime: string | Date): this {
    this.fields.expirationTime =
      expirationTime instanceof Date
        ? formatISO8601(expirationTime)
        : expirationTime
    return this
  }

  notBefore(notBefore: string | Date): this {
    this.fields.notBefore =
      notBefore instanceof Date ? formatISO8601(notBefore) : notBefore
    return this
  }

  requestId(requestId: string): this {
    this.fields.requestId = requestId
    return this
  }

  cluster(cluster: Cluster): this {
    this.fields.cluster = cluster
    return this
  }

  resources(resources: string[]): this {
    this.fields.resources = [...resources]
    return this
  }

  addResource(resource: string): this {
    if (!this.fields.resources) {
      this.fields.resources = []
    }
    this.fields.resources.push(resource)
    return this
  }

  build(): SiwsMessage {
    const missing: string[] = []
    if (!this.fields.domain) missing.push("domain")
    if (!this.fields.address) missing.push("address")
    if (!this.fields.uri) missing.push("uri")
    if (!this.fields.nonce) missing.push("nonce")
    if (!this.fields.issuedAt) missing.push("issuedAt")
    if (!this.fields.cluster) missing.push("cluster")

    if (missing.length > 0) {
      throw new SiwsError(
        SiwsErrorCode.MISSING_REQUIRED_FIELD,
        `Missing required fields: ${missing.join(", ")}`,
      )
    }

    return new SiwsMessage(this.fields as SiwsMessageFields)
  }
}

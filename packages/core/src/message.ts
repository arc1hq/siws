import type { SiwsMessageFields, Cluster } from '@/types'
import { parseMessage } from '@/parser'
import { validateAllFields } from '@/validator'
import { SIWS_VERSION } from '@/constants'
import { formatISO8601 } from '@/utils'
import { SiwsError, SiwsErrorCode } from '@/errors'

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
  readonly cluster?: Cluster
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

  static parse(message: string): SiwsMessage {
    const fields = parseMessage(message)
    return new SiwsMessage(fields)
  }

  toMessage(): string {
    const lines: string[] = []

    lines.push(`${this.domain} wants you to sign in with your Solana account:`)
    lines.push(this.address)
    lines.push('')

    if (this.statement) {
      lines.push(this.statement)
      lines.push('')
    }

    lines.push(`URI: ${this.uri}`)
    lines.push(`Version: ${this.version}`)
    lines.push(`Nonce: ${this.nonce}`)
    lines.push(`Issued At: ${this.issuedAt}`)

    if (this.expirationTime) {
      lines.push(`Expiration Time: ${this.expirationTime}`)
    }

    if (this.notBefore) {
      lines.push(`Not Before: ${this.notBefore}`)
    }

    if (this.requestId) {
      lines.push(`Request ID: ${this.requestId}`)
    }

    if (this.cluster) {
      lines.push(`Cluster: ${this.cluster}`)
    }

    if (this.resources && this.resources.length > 0) {
      lines.push('Resources:')
      for (const resource of this.resources) {
        lines.push(`- ${resource}`)
      }
    }

    return lines.join('\n')
  }

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
    this.fields.issuedAt = issuedAt instanceof Date ? formatISO8601(issuedAt) : issuedAt
    return this
  }

  statement(statement: string): this {
    this.fields.statement = statement
    return this
  }

  expirationTime(expirationTime: string | Date): this {
    this.fields.expirationTime = expirationTime instanceof Date ? formatISO8601(expirationTime) : expirationTime
    return this
  }

  notBefore(notBefore: string | Date): this {
    this.fields.notBefore = notBefore instanceof Date ? formatISO8601(notBefore) : notBefore
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
    if (!this.fields.domain) missing.push('domain')
    if (!this.fields.address) missing.push('address')
    if (!this.fields.uri) missing.push('uri')
    if (!this.fields.nonce) missing.push('nonce')
    if (!this.fields.issuedAt) missing.push('issuedAt')

    if (missing.length > 0) {
      throw new SiwsError(
        SiwsErrorCode.MISSING_REQUIRED_FIELD,
        `Missing required fields: ${missing.join(', ')}`
      )
    }

    return new SiwsMessage(this.fields as SiwsMessageFields)
  }
}

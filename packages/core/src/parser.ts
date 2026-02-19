import type { SiwsMessageFields, Cluster } from '@/types'
import { SiwsError, SiwsErrorCode } from '@/errors'
import { CLUSTERS } from '@/constants'

const DOMAIN_LINE_SUFFIX = ' wants you to sign in with your Solana account:'

export function parseMessage(message: string): SiwsMessageFields {
  const lines = message.split('\n')

  if (lines.length < 6) {
    throw new SiwsError(
      SiwsErrorCode.PARSE_ERROR,
      'Message is too short to be valid'
    )
  }

  const domainLine = lines[0]
  if (!domainLine || !domainLine.endsWith(DOMAIN_LINE_SUFFIX)) {
    throw new SiwsError(
      SiwsErrorCode.PARSE_ERROR,
      'Invalid message format: missing domain line'
    )
  }

  const domain = domainLine.slice(0, -DOMAIN_LINE_SUFFIX.length)
  const address = lines[1]

  if (!address) {
    throw new SiwsError(
      SiwsErrorCode.PARSE_ERROR,
      'Invalid message format: missing address'
    )
  }

  let lineIndex = 2
  let statement: string | undefined

  if (lines[lineIndex] === '') {
    lineIndex++

    const nextLine = lines[lineIndex]
    const fieldPrefixes = ['URI: ', 'Version: ', 'Nonce: ', 'Issued At: ', 'Expiration Time: ', 'Not Before: ', 'Request ID: ', 'Cluster: ', 'Resources:']
    const isFieldLine = nextLine !== undefined && fieldPrefixes.some(prefix => nextLine.startsWith(prefix))

    if (!isFieldLine && nextLine !== undefined && nextLine !== '') {
      const statementLines: string[] = []

      while (lineIndex < lines.length && lines[lineIndex] !== '') {
        statementLines.push(lines[lineIndex]!)
        lineIndex++
      }

      if (statementLines.length > 1) {
        throw new SiwsError(
          SiwsErrorCode.PARSE_ERROR,
          'Statement must be a single line (no newlines allowed)'
        )
      }

      if (statementLines.length === 1) {
        statement = statementLines[0]
      }

      if (lines[lineIndex] === '') {
        lineIndex++
      }
    }
  }

  const fields = parseFieldLines(lines.slice(lineIndex))
  const resources = parseResources(lines, lineIndex)

  const uri = fields.get('URI')
  const version = fields.get('Version')
  const nonce = fields.get('Nonce')
  const issuedAt = fields.get('Issued At')

  if (!uri) {
    throw new SiwsError(SiwsErrorCode.PARSE_ERROR, 'Missing required field: URI')
  }
  if (!version) {
    throw new SiwsError(SiwsErrorCode.PARSE_ERROR, 'Missing required field: Version')
  }
  if (!nonce) {
    throw new SiwsError(SiwsErrorCode.PARSE_ERROR, 'Missing required field: Nonce')
  }
  if (!issuedAt) {
    throw new SiwsError(SiwsErrorCode.PARSE_ERROR, 'Missing required field: Issued At')
  }

  return {
    domain,
    address,
    statement,
    uri,
    version,
    nonce,
    issuedAt,
    expirationTime: fields.get('Expiration Time'),
    notBefore: fields.get('Not Before'),
    requestId: fields.get('Request ID'),
    cluster: parseCluster(fields.get('Cluster')),
    resources,
  }
}

function parseFieldLines(lines: string[]): Map<string, string> {
  const fields = new Map<string, string>()

  for (const line of lines) {
    if (line.startsWith('- ') || line === '' || line === 'Resources:') {
      continue
    }

    const colonIndex = line.indexOf(': ')
    if (colonIndex === -1) {
      continue
    }

    const key = line.substring(0, colonIndex)
    const value = line.substring(colonIndex + 2)
    fields.set(key, value)
  }

  return fields
}

function parseCluster(value: string | undefined): Cluster {
  if (value === undefined) {
    throw new SiwsError(
      SiwsErrorCode.MISSING_REQUIRED_FIELD,
      'Missing required field: Cluster'
    )
  }
  if (CLUSTERS.includes(value as Cluster)) {
    return value as Cluster
  }
  throw new SiwsError(
    SiwsErrorCode.INVALID_CLUSTER,
    `Invalid cluster: ${value}`,
    CLUSTERS.join(' | '),
    value
  )
}

function parseResources(lines: string[], startIndex: number): string[] | undefined {
  const resourcesIndex = lines.slice(startIndex).findIndex(line => line === 'Resources:')
  if (resourcesIndex === -1) {
    return undefined
  }

  const absoluteIndex = startIndex + resourcesIndex
  const resources: string[] = []

  for (let i = absoluteIndex + 1; i < lines.length; i++) {
    const line = lines[i]
    if (line === '' || line === undefined) {
      continue
    }
    if (!line.startsWith('- ')) {
      throw new SiwsError(
        SiwsErrorCode.PARSE_ERROR,
        `Invalid resource format: "${line}" (must start with "- ")`
      )
    }
    resources.push(line.substring(2))
  }

  return resources.length > 0 ? resources : undefined
}

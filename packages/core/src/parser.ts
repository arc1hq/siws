import type { SiwsMessageFields, Cluster } from "@/types"
import { SiwsError, SiwsErrorCode } from "@/errors"
import { CLUSTERS } from "@/constants"
import { DOMAIN_LINE_SUFFIX, serializeMessage } from "@/serializer"

const FIELD_KEYS = [
  "URI",
  "Version",
  "Nonce",
  "Issued At",
  "Expiration Time",
  "Not Before",
  "Request ID",
  "Cluster",
] as const

type FieldKey = (typeof FIELD_KEYS)[number]

const RESOURCES_HEADER = "Resources:"

function parseError(message: string): SiwsError {
  return new SiwsError(SiwsErrorCode.PARSE_ERROR, message)
}

/**
 * True if `line` starts like a field line (`URI: `, `Nonce: `, ...,
 * `Resources:`). Statements may not look like this.
 */
export function isFieldLine(line: string): boolean {
  return (
    line === RESOURCES_HEADER ||
    FIELD_KEYS.some((key) => line.startsWith(`${key}: `))
  )
}

/**
 * Parse a raw SIWS message string into its fields.
 *
 * Parsing is strict: the input must be in canonical form, i.e. byte-for-byte
 * identical to what `serializeMessage` produces for the parsed fields (LF line
 * endings, fixed field order, no duplicate or unknown lines, no trailing
 * newline). Anything else throws `PARSE_ERROR`, so the string a wallet signed
 * always maps to exactly one set of fields.
 *
 * Field *values* are not validated here; `SiwsMessage` does that.
 */
export function parseMessage(message: string): SiwsMessageFields {
  if (message.includes("\r")) {
    throw parseError(
      "Invalid message format: carriage return found (lines must be separated by LF only)",
    )
  }

  const lines = message.split("\n")

  if (lines.length < 6) {
    throw parseError("Message is too short to be valid")
  }

  const domainLine = lines[0]
  if (!domainLine || !domainLine.endsWith(DOMAIN_LINE_SUFFIX)) {
    throw parseError("Invalid message format: missing domain line")
  }

  const domain = domainLine.slice(0, -DOMAIN_LINE_SUFFIX.length)
  const address = lines[1]

  if (!address) {
    throw parseError("Invalid message format: missing address")
  }

  if (lines[2] !== "") {
    throw parseError(
      "Invalid message format: expected an empty line after the address",
    )
  }

  let lineIndex = 3
  let statement: string | undefined

  const firstLine = lines[lineIndex]
  if (firstLine !== undefined && firstLine !== "" && !isFieldLine(firstLine)) {
    const statementLines: string[] = []

    while (lineIndex < lines.length && lines[lineIndex] !== "") {
      statementLines.push(lines[lineIndex]!)
      lineIndex++
    }

    if (statementLines.length > 1) {
      throw parseError("Statement must be a single line (no newlines allowed)")
    }

    statement = statementLines[0]

    if (lines[lineIndex] !== "") {
      throw parseError(
        "Invalid message format: expected an empty line after the statement",
      )
    }
    lineIndex++
  }

  const { fields, resources } = parseFieldLines(lines.slice(lineIndex))

  const uri = fields.get("URI")
  const version = fields.get("Version")
  const nonce = fields.get("Nonce")
  const issuedAt = fields.get("Issued At")

  if (!uri) {
    throw parseError("Missing required field: URI")
  }
  if (!version) {
    throw parseError("Missing required field: Version")
  }
  if (!nonce) {
    throw parseError("Missing required field: Nonce")
  }
  if (!issuedAt) {
    throw parseError("Missing required field: Issued At")
  }

  const parsed: SiwsMessageFields = {
    domain,
    address,
    statement,
    uri,
    version,
    nonce,
    issuedAt,
    expirationTime: fields.get("Expiration Time"),
    notBefore: fields.get("Not Before"),
    requestId: fields.get("Request ID"),
    cluster: parseCluster(fields.get("Cluster")),
    resources,
  }

  // Final canonical-form guard: catches anything the line checks above allow
  // but that would serialize differently (field order, empty values, an empty
  // "Resources:" section, ...).
  if (serializeMessage(parsed) !== message) {
    throw parseError(
      "Message is not in canonical SIWS format (check field order, blank lines and trailing newline)",
    )
  }

  return parsed
}

function parseFieldLines(lines: string[]): {
  fields: Map<FieldKey, string>
  resources: string[] | undefined
} {
  const fields = new Map<FieldKey, string>()
  let resources: string[] | undefined

  for (const line of lines) {
    if (resources !== undefined) {
      if (!line.startsWith("- ")) {
        throw parseError(
          `Invalid resource format: "${line}" (must start with "- ")`,
        )
      }
      resources.push(line.substring(2))
      continue
    }

    if (line === RESOURCES_HEADER) {
      resources = []
      continue
    }

    if (line === "") {
      throw parseError("Invalid message format: unexpected empty line")
    }

    const key = FIELD_KEYS.find((k) => line.startsWith(`${k}: `))
    if (key === undefined) {
      throw parseError(`Invalid message format: unexpected line "${line}"`)
    }
    if (fields.has(key)) {
      throw parseError(`Duplicate field: ${key}`)
    }
    fields.set(key, line.substring(key.length + 2))
  }

  return {
    fields,
    resources: resources && resources.length > 0 ? resources : undefined,
  }
}

function parseCluster(value: string | undefined): Cluster {
  if (value === undefined) {
    throw new SiwsError(
      SiwsErrorCode.MISSING_REQUIRED_FIELD,
      "Missing required field: Cluster",
    )
  }
  if (CLUSTERS.includes(value as Cluster)) {
    return value as Cluster
  }
  throw new SiwsError(
    SiwsErrorCode.INVALID_CLUSTER,
    `Invalid cluster: ${value}`,
    CLUSTERS.join(" | "),
    value,
  )
}

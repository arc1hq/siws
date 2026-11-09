import type { SiwsMessageFields } from "@/types"

export const DOMAIN_LINE_SUFFIX =
  " wants you to sign in with your Solana account:"

/**
 * Serialize fields into the canonical SIWS message string. This is the exact
 * byte sequence a wallet signs: lines joined by `\n`, fixed field order, no
 * trailing newline.
 */
export function serializeMessage(fields: SiwsMessageFields): string {
  const lines: string[] = []

  lines.push(`${fields.domain}${DOMAIN_LINE_SUFFIX}`)
  lines.push(fields.address)
  lines.push("")

  if (fields.statement) {
    lines.push(fields.statement)
    lines.push("")
  }

  lines.push(`URI: ${fields.uri}`)
  lines.push(`Version: ${fields.version}`)
  lines.push(`Nonce: ${fields.nonce}`)
  lines.push(`Issued At: ${fields.issuedAt}`)

  if (fields.expirationTime) {
    lines.push(`Expiration Time: ${fields.expirationTime}`)
  }

  if (fields.notBefore) {
    lines.push(`Not Before: ${fields.notBefore}`)
  }

  if (fields.requestId) {
    lines.push(`Request ID: ${fields.requestId}`)
  }

  lines.push(`Cluster: ${fields.cluster}`)

  if (fields.resources && fields.resources.length > 0) {
    lines.push("Resources:")
    for (const resource of fields.resources) {
      lines.push(`- ${resource}`)
    }
  }

  return lines.join("\n")
}

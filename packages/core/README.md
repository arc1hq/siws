# @siws/core

Core library for **Sign In With Solana** (SIWS) - a standard for authenticating users with Solana wallets.

## Why @siws/core?

- Build and parse SIWS messages with a clean builder API
- Verify Ed25519 signatures with built-in domain and nonce binding
- Generate secure nonces out of the box
- Ships with TypeScript types

## Installation

```bash
npm install @siws/core
```

```bash
pnpm add @siws/core
```

```bash
yarn add @siws/core
```

## Quick Start

```typescript
import { SiwsMessageBuilder, verifySignature, generateNonce } from "@siws/core"

// 1. Generate a nonce (server-side)
const nonce = generateNonce()

// 2. Build a SIWS message (client-side)
const message = new SiwsMessageBuilder()
  .domain("example.com")
  .address("BN3gPdNeRfDjKJjXByeGzLptPjNZmELPdUKFwmPgk9kq")
  .uri("https://example.com/login")
  .nonce(nonce)
  .issuedAt(new Date())
  .cluster("mainnet-beta")
  .statement("Sign in to Example App")
  .build()

// 3. Get the message string for wallet to sign
const messageString = message.toMessage()

// 4. Verify signature (server-side). Always pass domain and nonce.
const result = await verifySignature(messageString, signature, undefined, {
  domain: "example.com",
  nonce: nonce,
})

if (result.success) {
  console.log("Authenticated!", result.data.address) // data is typed here
} else {
  console.error("Failed:", result.error.code) // error is typed here
}
```

## API Reference

### `SiwsMessageBuilder`

Fluent builder for constructing SIWS messages.

```typescript
const message = new SiwsMessageBuilder()
  .domain("example.com") // Required: Domain requesting sign-in
  .address("BN3gPd...") // Required: Solana wallet address
  .uri("https://example.com") // Required: URI of the resource
  .nonce("abc123xyz") // Required: Unique nonce
  .issuedAt(new Date()) // Required: Timestamp (Date or ISO string)
  .statement("Sign in") // Optional: Human-readable message
  .expirationTime(new Date()) // Optional: Message expiration
  .notBefore(new Date()) // Optional: Earliest valid time
  .requestId("req-123") // Optional: Request identifier
  .cluster("mainnet-beta") // Required: Solana cluster
  .resources(["https://..."]) // Optional: Resource URIs
  .addResource("https://...") // Optional: Add single resource
  .build() // Returns SiwsMessage
```

### `SiwsMessage`

Represents a parsed or built SIWS message.

```typescript
// Parse from string (strict: input must be in canonical form, see below)
const message = SiwsMessage.parse(messageString)

// Access fields
message.domain // string
message.address // string
message.uri // string
message.version // string (always "1")
message.nonce // string
message.issuedAt // string (ISO 8601)
message.statement // string | undefined
message.cluster // 'mainnet-beta' | 'devnet' | 'testnet'
// ... other optional fields

// Serialize back to string
const str = message.toMessage()

// Export all fields
const fields = message.toFields()
```

### `verifySignature()`

Verifies an Ed25519 signature against a SIWS message.

```typescript
async function verifySignature(
  message: string | SiwsMessage,
  signature: string, // Base58-encoded signature
  publicKey?: string, // Optional: must equal message.address if given
  options?: VerificationOptions,
): Promise<VerificationResult>

// Options
interface VerificationOptions {
  domain?: string // Validate domain matches (omit = no domain binding!)
  nonce?: string // Validate nonce matches (omit = no replay protection!)
  time?: Date // Custom time for expiration check
}

// Result: discriminated union, `if (result.success)` narrows both branches
type VerificationResult =
  | { success: true; data: SiwsMessageFields; error?: undefined }
  | { success: false; error: SiwsError; data?: undefined }
```

- The signature is always checked against the `address` in the message. If
  you pass `publicKey` (for example the address the client claims) and it
  differs from the message address, verification fails with
  `INVALID_ADDRESS`.
- `domain` and `nonce` are optional, but omitting `domain` disables domain
  binding and omitting `nonce` disables replay protection. Pass both in
  production.
- `verifySignature` never throws; failures come back as
  `{ success: false, error }`.

### `generateNonce()`

Generates a cryptographically secure random nonce.

```typescript
function generateNonce(length?: number): string

// Default length: 16 characters
// Minimum length: 8 characters
// Alphabet: Base58 (alphanumeric, no ambiguous characters)

const nonce = generateNonce() // "7KxNMbvQrF2pJ4Ys"
const longer = generateNonce(32) // 32-character nonce
```

### `SiwsError` & `SiwsErrorCode`

Structured error handling with specific error codes.

```typescript
import { SiwsError, SiwsErrorCode } from "@siws/core"

// Error codes
SiwsErrorCode.INVALID_DOMAIN
SiwsErrorCode.INVALID_ADDRESS
SiwsErrorCode.INVALID_SIGNATURE
SiwsErrorCode.MESSAGE_EXPIRED
SiwsErrorCode.MESSAGE_NOT_YET_VALID
SiwsErrorCode.DOMAIN_MISMATCH
SiwsErrorCode.NONCE_MISMATCH
SiwsErrorCode.SIGNATURE_VERIFICATION_FAILED
// ... and more

// Error properties
error.code // SiwsErrorCode
error.message // Human-readable message
error.expected // Expected value (for mismatches)
error.received // Received value (for mismatches)
```

### Types

```typescript
import type {
  Cluster,
  SiwsMessageFields,
  VerificationOptions,
  VerificationResult,
} from "@siws/core"

type Cluster = "mainnet-beta" | "devnet" | "testnet"

interface SiwsMessageFields {
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
  cluster: Cluster
  resources?: string[]
}
```

### Constants

```typescript
import { SIWS_VERSION, CLUSTERS } from "@siws/core"

SIWS_VERSION // "1"
CLUSTERS // ['mainnet-beta', 'devnet', 'testnet']
```

## Message Format

SIWS messages follow this format:

```
example.com wants you to sign in with your Solana account:
BN3gPdNeRfDjKJjXByeGzLptPjNZmELPdUKFwmPgk9kq

Sign in to Example App

URI: https://example.com/login
Version: 1
Nonce: abc123xyz789
Issued At: 2024-01-15T12:00:00.000Z
Expiration Time: 2024-01-15T13:00:00.000Z
Cluster: mainnet-beta
Resources:
- https://example.com/api
- https://example.com/profile
```

### Strict parsing

`SiwsMessage.parse()` and `verifySignature()` only accept messages in
canonical form: the input must be byte-for-byte equal to `toMessage()` of the
parsed result. The parser rejects the following with `PARSE_ERROR`:

- CRLF line endings or a trailing newline
- fields out of order, duplicate fields (e.g. two `Nonce:` lines), unknown
  fields, or junk lines
- extra or missing blank lines, and a statement that looks like a field line
- an empty `Resources:` section

Because of this, one signed string always maps to exactly one set of fields.
Always verify the exact string the wallet signed, and do not re-wrap or
reformat it.

## Security Considerations

1. **Always validate the domain** - Pass the expected domain in verification options
2. **Always validate the nonce** - Store server-generated nonces and verify them
3. **Use expiration times** - Set reasonable expiration windows (e.g., 10 minutes)
4. **Generate fresh nonces** - Never reuse nonces across sign-in attempts
5. **Verify on the server** - Never trust client-side verification alone
6. **Bind the account** - Use `result.data.address` as the authenticated
   account, or pass the client's claimed address as `publicKey` (it must match
   the message address)

```typescript
// Recommended verification pattern
const result = await verifySignature(message, signature, claimedAddress, {
  domain: "example.com", // Your domain
  nonce: storedNonce, // Server-stored nonce
})
```

## Requirements

- Node.js >= 20 (uses the global Web Crypto `crypto.getRandomValues`)

## License

MIT

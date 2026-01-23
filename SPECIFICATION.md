---
siws: 1
title: Sign In With Solana
status: Draft
type: Standard
author: osiws contributors
created: 2026-01-23
license: CC0-1.0
---

# Sign In With Solana (SIWS)

A standard message format and verification process for authenticating Solana wallet owners.

## Abstract

This specification defines a method for Solana wallet owners to authenticate with off-chain services by signing a standardized message format. It enables applications to verify wallet ownership without requiring on-chain transactions, providing a decentralized alternative to traditional authentication.

## Motivation

Solana wallets are widely deployed for managing digital assets, yet no standardized method exists for using them as authentication credentials. Existing implementations vary significantly, resulting in:

- Inconsistent user experiences across applications
- Security vulnerabilities arising from ad-hoc implementations
- Lack of interoperability between authentication systems

This specification addresses these issues by defining a secure, human-readable message format and verification process.

## Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

Additional terms:

- **Wallet**: A cryptographic keypair capable of signing messages using Ed25519
- **Relying Party**: The service requesting authentication
- **Message**: The human-readable string presented to the user for signing

## Specification

### Message Format

A SIWS message MUST conform to the following structure:

```
${domain} wants you to sign in with your Solana account:
${address}

${statement}

URI: ${uri}
Version: ${version}
Nonce: ${nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}
Not Before: ${notBefore}
Request ID: ${requestId}
Cluster: ${cluster}
Resources:
- ${resources[0]}
- ${resources[1]}
- ...
```

### Required Fields

| Field | Description | Format |
|-------|-------------|--------|
| `domain` | RFC 3986 authority requesting authentication | `authority` per RFC 3986 |
| `address` | Solana wallet address | Base58-encoded Ed25519 public key |
| `uri` | RFC 3986 URI identifying the authentication target | `URI` per RFC 3986 |
| `version` | SIWS specification version | `1` |
| `nonce` | Randomized token for replay protection | Alphanumeric, ≥8 characters |
| `issuedAt` | Message creation timestamp | ISO 8601 datetime |

### Optional Fields

| Field | Description | Format |
|-------|-------------|--------|
| `statement` | Human-readable purpose description | UTF-8 string, no `\n` |
| `expirationTime` | Message expiration timestamp | ISO 8601 datetime |
| `notBefore` | Message validity start timestamp | ISO 8601 datetime |
| `requestId` | Application-specific request identifier | String |
| `cluster` | Solana network identifier | `mainnet-beta` \| `devnet` \| `testnet` |
| `resources` | Resources being authorized | Array of RFC 3986 URIs |

### Field Definitions

#### domain

The `domain` MUST be an RFC 3986 authority matching the origin requesting authentication. It MUST NOT include a URI scheme or path component. Relying parties MUST reject messages where `domain` does not match the expected value.

#### address

The `address` MUST be a Base58-encoded Ed25519 public key (32 bytes, 43-44 characters encoded). The signature MUST be verified against this public key.

#### uri

The `uri` MUST be a valid RFC 3986 URI. It SHOULD match the endpoint receiving the authentication request.

#### version

The `version` MUST be `1` for messages conforming to this specification.

#### nonce

The `nonce` MUST contain at least 8 alphanumeric characters generated using a cryptographically secure random number generator. Relying parties MUST:

1. Generate a unique nonce per authentication attempt
2. Store nonces server-side with an expiration time
3. Reject unknown, expired, or previously used nonces
4. Invalidate nonces after successful verification

**Recommendation**: Use ≥16 bytes of randomness, Base58 or hexadecimal encoded.

#### issuedAt

The `issuedAt` MUST be an ISO 8601 datetime string in UTC (indicated by `Z` suffix).

#### statement

The `statement` is OPTIONAL. If present, it MUST NOT contain newline characters (`\n` or `\r`). It SHOULD describe the authentication purpose in human-readable terms.

#### expirationTime

The `expirationTime` is OPTIONAL. If present, relying parties MUST reject messages where the current time exceeds this value.

**Recommendation**: 5–15 minutes from `issuedAt`.

#### notBefore

The `notBefore` is OPTIONAL. If present, relying parties MUST reject messages where the current time precedes this value.

#### cluster

The `cluster` is OPTIONAL. Valid values are `mainnet-beta`, `devnet`, and `testnet`. Relying parties MAY use this to prevent cross-network replay.

#### resources

The `resources` field is OPTIONAL. Each resource MUST be a valid RFC 3986 URI. This field MAY be used to specify resources the user is authorizing access to.

### Signature Verification

Solana uses Ed25519 for message signing. Verification MUST proceed as follows:

1. Encode the message string as UTF-8 bytes
2. Decode the signature from Base58 (64 bytes)
3. Decode the public key from Base58 (32 bytes)
4. Verify using Ed25519: `ed25519.verify(signature, message, publicKey)`

The signature is valid if and only if the Ed25519 verification succeeds.

### Message Grammar

The message format is defined using ABNF ([RFC 5234](https://www.rfc-editor.org/rfc/rfc5234)):

```abnf
siws-message    = domain-line LF address-line LF LF
                  [ statement-line LF LF ]
                  field-lines

domain-line     = domain " wants you to sign in with your Solana account:"
address-line    = address
statement-line  = statement

field-lines     = uri-field LF version-field LF nonce-field LF
                  issued-at-field LF
                  [ expiration-field LF ]
                  [ not-before-field LF ]
                  [ request-id-field LF ]
                  [ cluster-field LF ]
                  [ resources-field ]

uri-field       = "URI: " uri
version-field   = "Version: " version
nonce-field     = "Nonce: " nonce
issued-at-field = "Issued At: " iso8601-datetime
expiration-field = "Expiration Time: " iso8601-datetime
not-before-field = "Not Before: " iso8601-datetime
request-id-field = "Request ID: " request-id
cluster-field   = "Cluster: " cluster
resources-field = "Resources:" LF resource-list
resource-list   = 1*( "- " uri LF )

domain          = authority                    ; RFC 3986
address         = 43*44BASE58CHAR
uri             = URI                          ; RFC 3986
version         = "1"
nonce           = 8*ALPHANUM
statement       = 1*( %x20-7E )                ; printable ASCII, no newlines
request-id      = 1*( %x20-7E )
cluster         = "mainnet-beta" / "devnet" / "testnet"
iso8601-datetime = ; ISO 8601 datetime with Z suffix

ALPHANUM        = ALPHA / DIGIT
BASE58CHAR      = %x31-39 / %x41-48 / %x4A-4E / %x50-5A / %x61-6B / %x6D-7A
                  ; 1-9, A-H, J-N, P-Z, a-k, m-z (excludes 0, I, O, l)
LF              = %x0A
```

## Rationale

### Message Format

The message format follows [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) (Sign-In with Ethereum) to provide a familiar pattern for users and developers in the broader Web3 ecosystem. Human-readable messages allow users to understand what they are signing before approval.

### Ed25519 Signatures

Ed25519 is Solana's native signature algorithm. All Solana wallets support Ed25519 message signing, making it the natural choice for this specification. No alternative algorithms are supported to ensure maximum interoperability.

### Base58 Encoding

Base58 is the standard encoding for Solana addresses and signatures. It excludes visually ambiguous characters (0, O, I, l) reducing transcription errors.

### Nonce Requirements

Single-use, server-generated nonces prevent replay attacks. The 8-character minimum provides adequate entropy (≥47 bits with alphanumeric characters) while remaining practical for implementation.

## Security Considerations

### Replay Attacks

**Threat**: Captured signatures reused for unauthorized authentication.

**Mitigations**:
- Single-use nonces MUST be enforced
- Nonces MUST expire (RECOMMENDED: 5 minutes)
- `expirationTime` provides defense in depth

### Cross-Site Request Forgery

**Threat**: Signatures obtained from one site used on another.

**Mitigations**:
- `domain` MUST be verified server-side
- `uri` binds authentication to a specific endpoint
- Relying parties MUST reject domain/URI mismatches

### Phishing

**Threat**: Users deceived into signing messages for malicious sites.

**Mitigations**:
- Wallets SHOULD display the complete message before signing
- `domain` identifies the requesting party
- `statement` explains the authentication purpose
- Wallets SHOULD warn on unfamiliar domains

### Nonce Compromise

**Threat**: Leaked or predicted nonces enable replay attacks.

**Mitigations**:
- Generate nonces using CSPRNG
- Store nonces server-side only
- Bind nonces to session or client identifiers
- Implement proper expiration and cleanup

## Test Vectors

### Vector 1: Minimal Message

**Input Message**:
```
example.com wants you to sign in with your Solana account:
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

Sign in to Example

URI: https://example.com/auth
Version: 1
Nonce: k8sj2n4b
Issued At: 2024-01-15T12:00:00Z
```

**Parsed Fields**:
```json
{
  "domain": "example.com",
  "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "statement": "Sign in to Example",
  "uri": "https://example.com/auth",
  "version": "1",
  "nonce": "k8sj2n4b",
  "issuedAt": "2024-01-15T12:00:00Z"
}
```

### Vector 2: Complete Message

**Input Message**:
```
app.example.com wants you to sign in with your Solana account:
7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

Access your dashboard and manage settings.

URI: https://app.example.com/api/auth
Version: 1
Nonce: f7k2m9p4x1
Issued At: 2024-01-15T12:00:00.000Z
Expiration Time: 2024-01-15T12:10:00.000Z
Not Before: 2024-01-15T12:00:00.000Z
Request ID: req_abc123
Cluster: mainnet-beta
Resources:
- https://app.example.com/api/profile
- https://app.example.com/api/settings
```

**Parsed Fields**:
```json
{
  "domain": "app.example.com",
  "address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "statement": "Access your dashboard and manage settings.",
  "uri": "https://app.example.com/api/auth",
  "version": "1",
  "nonce": "f7k2m9p4x1",
  "issuedAt": "2024-01-15T12:00:00.000Z",
  "expirationTime": "2024-01-15T12:10:00.000Z",
  "notBefore": "2024-01-15T12:00:00.000Z",
  "requestId": "req_abc123",
  "cluster": "mainnet-beta",
  "resources": [
    "https://app.example.com/api/profile",
    "https://app.example.com/api/settings"
  ]
}
```

## References

- [RFC 2119: Key words for use in RFCs](https://www.rfc-editor.org/rfc/rfc2119)
- [RFC 3986: Uniform Resource Identifier](https://www.rfc-editor.org/rfc/rfc3986)
- [RFC 5234: ABNF Specification](https://www.rfc-editor.org/rfc/rfc5234)
- [ISO 8601: Date and time format](https://www.iso.org/iso-8601-date-and-time-format.html)
- [EIP-4361: Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)
- [Ed25519: High-speed high-security signatures](https://ed25519.cr.yp.to/)
- [Solana Documentation](https://docs.solana.com/)

## Copyright

This specification is released under CC0 1.0 Universal (Public Domain Dedication).

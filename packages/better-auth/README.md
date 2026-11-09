# @siws/better-auth

Sign In With Solana plugin for [better-auth](https://www.better-auth.com/) - batteries-included Solana wallet authentication.

## Why @siws/better-auth?

- Zero-config Solana wallet authentication
- Built-in nonce generation and message building
- Full EIP-4361 style message format with domain binding
- Automatic user creation and session management
- Multi-cluster support (mainnet-beta, devnet, testnet)

## Installation

```bash
npm install @siws/better-auth
```

```bash
pnpm add @siws/better-auth
```

```bash
yarn add @siws/better-auth
```

## Quick Start

### Server Setup

```typescript
import { betterAuth } from "better-auth"
import { siws } from "@siws/better-auth"

export const auth = betterAuth({
  baseURL: "https://example.com", // or set BETTER_AUTH_URL
  database: {
    // your database config
  },
  plugins: [
    siws({
      statement: "Sign in to MyApp",
      expirationTime: 600, // 10 minutes
    }),
  ],
})
```

The message domain and URI come from the `domain` / `uri` plugin options, or from the base URL you configured for better-auth: the static `baseURL` option or the `BETTER_AUTH_URL` environment variable (here `example.com` and `https://example.com`). They are never read from request headers. When no base URL is configured, better-auth falls back to the request's Host for its own use, but this plugin does not: both endpoints fail with `DOMAIN_NOT_CONFIGURED`. A dynamic `baseURL` (`{ allowedHosts }`) also counts as not configured, so set `domain` and `uri` in that case.

### Client Setup

```typescript
import { createAuthClient } from "better-auth/client"
import { siwsClient } from "@siws/better-auth/client"

const auth = createAuthClient({
  plugins: [siwsClient()],
})

// 1. Get nonce and message to sign
const { data: nonceData, error: nonceError } = await auth.siws.getNonce({
  address: walletAddress,
  cluster: "mainnet-beta",
})
if (nonceError) throw new Error(nonceError.message)

// 2. Sign message with wallet
const signature = await wallet.signMessage(
  new TextEncoder().encode(nonceData.message),
)

// 3. Verify signature and create session.
// `address` and `cluster` must match the ones used for the nonce.
const { data, error } = await auth.siws.verify({
  message: nonceData.message,
  signature: bs58.encode(signature),
  address: walletAddress,
  cluster: "mainnet-beta",
})

if (error) {
  console.error(error.code, error.message) // e.g. "INVALID_OR_EXPIRED_NONCE"
} else {
  console.log("Authenticated!", data.user)
}
```

## API Reference

### `siws(options?)`

Server-side plugin factory. Returns a better-auth plugin.

```typescript
import { siws } from "@siws/better-auth"

const plugin = siws({
  domain: "example.com", // defaults to the host of better-auth's baseURL
  uri: "https://example.com", // defaults to the origin of better-auth's baseURL
  statement: "Sign in to MyApp",
  expirationTime: 300,
  cluster: "mainnet-beta",
  resources: ["https://example.com/api"],
  emailDomainName: "siws.local",
  anonymous: true,
})
```

### `siwsClient()`

Client-side plugin for better-auth client.

```typescript
import { siwsClient } from '@siws/better-auth/client'

const client = createAuthClient({
  plugins: [siwsClient()],
})

// Available methods (both return better-fetch's `{ data, error }`):
await client.siws.getNonce({ address, cluster? })
await client.siws.verify({ message, signature, address, cluster?, email? })
```

### `schema`

Database schema definition for the `solanaAddress` table.

```typescript
import { schema } from "@siws/better-auth"
```

### `SiwsPluginErrorCode`

Error codes returned in the `code` field of error responses. The same codes, with their messages, are exported as `SIWS_ERROR_CODES` (`{ code, message }` per code) and registered as the plugin's `$ERROR_CODES`.

| Code                       | Status | When                                                                             |
| -------------------------- | ------ | -------------------------------------------------------------------------------- |
| `INVALID_ADDRESS`          | 400    | `address` is not a valid Solana address                                          |
| `INVALID_CLUSTER`          | 400    | `cluster` is not `mainnet-beta`, `devnet` or `testnet`                           |
| `INVALID_MESSAGE`          | 400    | The message is not a valid SIWS message                                          |
| `EMAIL_REQUIRED`           | 400    | `anonymous: false` and no `email` was sent                                       |
| `ADDRESS_MISMATCH`         | 401    | The message address differs from the request `address`                           |
| `CLUSTER_MISMATCH`         | 401    | The message cluster differs from the request `cluster`                           |
| `INVALID_OR_EXPIRED_NONCE` | 401    | The nonce was never issued, already used, or expired                             |
| `DOMAIN_MISMATCH`          | 401    | The message domain differs from the configured domain                            |
| `VERIFICATION_FAILED`      | 401    | The signature is invalid or the message failed verification                      |
| `EMAIL_ALREADY_IN_USE`     | 422    | `anonymous: false` and a user with that email already exists                     |
| `DOMAIN_NOT_CONFIGURED`    | 500    | No `domain`/`uri` option and no static better-auth `baseURL` / `BETTER_AUTH_URL` |

Unexpected server errors return a generic `500` response. The details go to the better-auth logger, not to the client.

### Types

```typescript
import type {
  SiwsOptions,
  SolanaAddress,
  NonceInput,
  NonceResponse,
  VerifyInput,
  VerifyResponse,
  Cluster,
} from "@siws/better-auth"

type Cluster = "mainnet-beta" | "devnet" | "testnet"

interface SolanaAddress {
  id: string
  userId: string
  address: string
  cluster: Cluster
  isPrimary: boolean
  createdAt: Date
}

interface NonceResponse {
  nonce: string
  message: string
}

interface VerifyResponse {
  success: true
  token: string
  user: {
    id: string
    address: string
    cluster: Cluster
  }
}
```

## Plugin Options

| Option            | Type       | Default          | Description                                                                       |
| ----------------- | ---------- | ---------------- | --------------------------------------------------------------------------------- |
| `domain`          | `string`   | `baseURL` host   | RFC 3986 authority bound into the message, e.g. `example.com` or `localhost:3000` |
| `uri`             | `string`   | `baseURL` origin | URI written into the message                                                      |
| `statement`       | `string`   | `undefined`      | Human-readable statement displayed when signing                                   |
| `expirationTime`  | `number`   | `300`            | Message expiration in seconds (5 minutes)                                         |
| `cluster`         | `Cluster`  | `'mainnet-beta'` | Default Solana cluster                                                            |
| `resources`       | `string[]` | `undefined`      | Resource URIs to include in the message                                           |
| `emailDomainName` | `string`   | `'siws.local'`   | Domain for synthetic email addresses                                              |
| `anonymous`       | `boolean`  | `true`           | Allow sign-up without email                                                       |
| `schema`          | `object`   | `undefined`      | Custom schema options for solanaAddress table                                     |

## Endpoints

### `POST /siws/nonce`

Request a nonce and SIWS message to sign.

**Request Body:**

```typescript
{
  address: string    // Solana wallet address (Base58)
  cluster?: Cluster  // Optional, defaults to plugin config
}
```

**Response:**

```typescript
{
  nonce: string // Cryptographic nonce
  message: string // SIWS message to sign
}
```

### `POST /siws/verify`

Verify a signed message and create a session.

**Request Body:**

```typescript
{
  message: string    // The SIWS message that was signed
  signature: string  // Base58-encoded Ed25519 signature
  address: string    // Solana wallet address
  cluster?: Cluster  // Optional, defaults to plugin config
  email?: string     // Required if anonymous: false
}
```

**Response:**

```typescript
{
  success: true
  token: string // Session token
  user: {
    id: string
    address: string
    cluster: Cluster
  }
}
```

## Database Schema

The plugin creates a `solanaAddress` table with the following fields:

| Field       | Type      | Description                                    |
| ----------- | --------- | ---------------------------------------------- |
| `id`        | `string`  | Primary key                                    |
| `userId`    | `string`  | Foreign key to user table (cascade delete)     |
| `address`   | `string`  | Solana wallet address                          |
| `cluster`   | `string`  | Solana cluster (mainnet-beta, devnet, testnet) |
| `isPrimary` | `boolean` | Whether this is the user's primary address     |
| `createdAt` | `date`    | When the address was linked                    |

A user can have multiple Solana addresses linked across different clusters.

The pair (`address`, `cluster`) has a unique index. Sign-in creates the user, the address link and the account in one transaction. If two first sign-ins for the same wallet (or the same email when `anonymous: false`) run at the same time, the database's unique constraints reject the second one, which rolls back, retries once and signs into the user the first one created. Use an adapter with transaction support (Postgres, MySQL, SQLite) to get this guarantee; the memory adapter enforces neither constraint.

> **Upgrading from 0.1.x:** 0.2.0 adds the unique index, so run your better-auth migrations (`npx @better-auth/cli migrate` or `generate`). If existing data has duplicate (`address`, `cluster`) rows, remove them first or the migration will fail.

## Security Considerations

1. **Domain binding** - The message domain comes from server configuration (`domain`, or the host of better-auth's `baseURL`), never from the `Origin` / `Host` request headers. Verification rejects any message whose domain differs, so a signature collected by a phishing site cannot be used against your app.
2. **Explicit configuration only** - The domain is taken only from `domain` / `uri`, a static `baseURL`, or `BETTER_AUTH_URL`, all read at startup. If none is set, SIWS requests fail with `DOMAIN_NOT_CONFIGURED` instead of trusting the request's Host header.
3. **Single-use nonces** - Each nonce is tied to one address and cluster and is consumed atomically (better-auth's `consumeVerificationValue`) before the signature is checked. Of several concurrent requests, only one can use it. A failed attempt also uses up the nonce; the client must request a new one.
4. **Request/message binding** - The `address` and `cluster` in the verify request must match the signed message.
5. **Signature verification** - Ed25519 signatures are verified against the message address.
6. **No duplicate users** - Concurrent first sign-ins resolve to one user through the unique (`address`, `cluster`) index and a transactional retry.
7. **No error leakage** - Unexpected errors are logged and returned as a generic `500`.
8. **Expiration times** - Use reasonable expiration windows (default: 5 minutes)

```typescript
// Recommended production configuration
betterAuth({
  baseURL: "https://example.com",
  plugins: [
    siws({
      statement: "Sign in to MyApp",
      expirationTime: 300, // 5 minutes
      anonymous: false, // Require email for account recovery
    }),
  ],
})
```

## Requirements

- Node.js >= 20
- better-auth >= 1.7.7 < 2
- @siws/core ^0.2.0 (installed automatically as a dependency)

## License

MIT

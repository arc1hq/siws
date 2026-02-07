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
import { betterAuth } from 'better-auth'
import { siws } from '@siws/better-auth'

export const auth = betterAuth({
  database: {
    // your database config
  },
  plugins: [
    siws({
      statement: 'Sign in to MyApp',
      expirationTime: 600, // 10 minutes
    }),
  ],
})
```

### Client Setup

```typescript
import { createAuthClient } from 'better-auth/client'
import { siwsClient } from '@siws/better-auth/client'

const auth = createAuthClient({
  plugins: [siwsClient()],
})

// 1. Get nonce and message to sign
const { nonce, message } = await auth.siws.getNonce({
  address: walletAddress,
  cluster: 'mainnet-beta',
})

// 2. Sign message with wallet
const signature = await wallet.signMessage(new TextEncoder().encode(message))

// 3. Verify signature and create session
const { success, user, token } = await auth.siws.verify({
  message,
  signature: bs58.encode(signature),
  address: walletAddress,
})

if (success) {
  console.log('Authenticated!', user)
}
```

## API Reference

### `siws(options?)`

Server-side plugin factory. Returns a better-auth plugin.

```typescript
import { siws } from '@siws/better-auth'

const plugin = siws({
  statement: 'Sign in to MyApp',
  expirationTime: 300,
  cluster: 'mainnet-beta',
  resources: ['https://example.com/api'],
  emailDomainName: 'siws.local',
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

// Available methods:
await client.siws.getNonce({ address, cluster? })
await client.siws.verify({ message, signature, address, cluster?, email? })
```

### `schema`

Database schema definition for the `solanaAddress` table.

```typescript
import { schema } from '@siws/better-auth'
```

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
} from '@siws/better-auth'

type Cluster = 'mainnet-beta' | 'devnet' | 'testnet'

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
  success: boolean
  token?: string
  user?: {
    id: string
    address: string
    cluster: Cluster
  }
}
```

## Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `statement` | `string` | `undefined` | Human-readable statement displayed when signing |
| `expirationTime` | `number` | `300` | Message expiration in seconds (5 minutes) |
| `cluster` | `Cluster` | `'mainnet-beta'` | Default Solana cluster |
| `resources` | `string[]` | `undefined` | Resource URIs to include in the message |
| `emailDomainName` | `string` | `'siws.local'` | Domain for synthetic email addresses |
| `anonymous` | `boolean` | `true` | Allow sign-up without email |
| `schema` | `object` | `undefined` | Custom schema options for solanaAddress table |

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
  nonce: string   // Cryptographic nonce
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
  success: boolean
  token: string      // Session token
  user: {
    id: string
    address: string
    cluster: Cluster
  }
}
```

## Database Schema

The plugin creates a `solanaAddress` table with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Primary key |
| `userId` | `string` | Foreign key to user table (cascade delete) |
| `address` | `string` | Solana wallet address |
| `cluster` | `string` | Solana cluster (mainnet-beta, devnet, testnet) |
| `isPrimary` | `boolean` | Whether this is the user's primary address |
| `createdAt` | `date` | When the address was linked |

A user can have multiple Solana addresses linked across different clusters.

## Security Considerations

1. **Domain binding** - Messages are bound to your domain, preventing phishing attacks
2. **Nonce validation** - Each nonce is single-use and expires after the configured time
3. **Signature verification** - Ed25519 signatures are verified against the message
4. **Session management** - Sessions are managed by better-auth with secure cookies
5. **Expiration times** - Use reasonable expiration windows (default: 5 minutes)

```typescript
// Recommended production configuration
siws({
  statement: 'Sign in to MyApp',
  expirationTime: 300,  // 5 minutes
  anonymous: false,     // Require email for account recovery
})
```

## Requirements

- Node.js >= 18
- better-auth >= 1.0.0
- @siws/core (peer dependency)

## License

MIT

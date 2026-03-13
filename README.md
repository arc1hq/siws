# Sign In With Solana (SIWS)

A standard message format and verification process for authenticating Solana wallet owners -- no on-chain transactions required. Follows the pattern established by [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) (Sign-In with Ethereum).

## Key Features

- **Human-readable messages** -- Users see what they're signing before approval
- **Ed25519 signatures** -- Native Solana signing, no transactions needed
- **Replay protection** -- Server-generated nonces prevent reuse
- **Domain binding** -- Messages bound to the requesting origin
- **Expiration support** -- Configurable message lifetime
- **Cluster awareness** -- Prevents cross-cluster replay (`mainnet-beta`, `devnet`, `testnet`)

## Quick Example

```ts
import { SiwsMessageBuilder, generateNonce, verifySignature } from "@siws/core"

// 1. Build a message for the user to sign
const message = new SiwsMessageBuilder()
  .domain("example.com")
  .address(walletAddress)
  .uri("https://example.com/auth")
  .nonce(generateNonce())
  .issuedAt(new Date())
  .cluster("mainnet-beta")
  .statement("Sign in to Example")
  .build()

// 2. Send message.toMessage() to the client for signing

// 3. Verify the signature
const result = await verifySignature(messageString, signature, walletAddress, {
  domain: "example.com",
})

if (result.success) {
  // Authenticated! result.data contains parsed message fields
}
```

## Packages

| Package                                                                | Description                                                                                   |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`@siws/core`](https://www.npmjs.com/package/@siws/core)               | Message building, parsing, and Ed25519 signature verification                                 |
| [`@siws/better-auth`](https://www.npmjs.com/package/@siws/better-auth) | Drop-in plugin for [better-auth](https://www.better-auth.com/) with server and client support |

### @siws/core

```bash
npm install @siws/core
```

Core library implementing the SIWS specification -- message construction, parsing, validation, and signature verification.

**Requirements:** Node.js >= 18. No native dependencies -- uses `@noble/curves` and `bs58`.

### @siws/better-auth

```bash
npm install @siws/better-auth
```

A [better-auth](https://www.better-auth.com/) plugin that handles the complete SIWS flow -- nonce generation, message building, signature verification, user management, and session creation.

**Server:**

```ts
import { betterAuth } from "better-auth"
import { siws } from "@siws/better-auth"

export const auth = betterAuth({
  plugins: [
    siws({
      statement: "Sign in to MyApp",
      expirationTime: 300,
      cluster: "mainnet-beta",
    }),
  ],
})
```

**Client:**

```ts
import { createAuthClient } from "better-auth/client"
import { siwsClient } from "@siws/better-auth/client"

export const auth = createAuthClient({
  plugins: [siwsClient()],
})

// Get nonce and message
const { nonce, message } = await auth.siws.getNonce({
  address: walletAddress,
  cluster: "mainnet-beta",
})

// Sign with wallet and verify
const signature = await wallet.signMessage(new TextEncoder().encode(message))
const result = await auth.siws.verify({
  message,
  signature: bs58.encode(signature),
  address: walletAddress,
})
```

## Links

- Website: [osiws.com](https://osiws.com)
- [Specification](https://osiws.com/docs/specification) -- Message format and verification rules
- [Documentation](https://osiws.com/docs) -- Full docs
- npm: [@siws](https://www.npmjs.com/org/siws)

## License

MIT

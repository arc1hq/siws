import type { BetterAuthClientPlugin } from 'better-auth/client'
import type { Cluster, NonceResponse, VerifyResponse } from './types'

/**
 * Client-side plugin for Sign In With Solana.
 *
 * @example
 * ```ts
 * import { createAuthClient } from 'better-auth/client'
 * import { siwsClient } from '@siws/better-auth/client'
 *
 * const auth = createAuthClient({
 *   plugins: [siwsClient()],
 * })
 *
 * // Get nonce and message to sign
 * const { nonce, message } = await auth.siws.getNonce({
 *   address: walletAddress,
 *   cluster: 'mainnet-beta',
 * })
 *
 * // Sign message with wallet and verify
 * const signature = await wallet.signMessage(message)
 * const { success, user } = await auth.siws.verify({
 *   message,
 *   signature,
 *   address: walletAddress,
 * })
 * ```
 */
export function siwsClient() {
  return {
    id: 'siws',
    $InferServerPlugin: {} as ReturnType<typeof import('./index').siws>,
    getActions($fetch) {
      return {
        siws: {
          /**
           * Request a nonce and SIWS message to sign.
           */
          getNonce: async (input: { address: string; cluster?: Cluster }) => {
            const response = await $fetch<NonceResponse>('/siws/nonce', {
              method: 'POST',
              body: input,
            })
            return response
          },

          /**
           * Verify a signed SIWS message and create a session.
           */
          verify: async (input: {
            message: string
            signature: string
            address: string
            cluster?: Cluster
            email?: string
          }) => {
            const response = await $fetch<VerifyResponse>('/siws/verify', {
              method: 'POST',
              body: input,
            })
            return response
          },
        },
      }
    },
  } satisfies BetterAuthClientPlugin
}

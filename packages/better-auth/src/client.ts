import type { BetterAuthClientPlugin } from "better-auth/client"
import type { Cluster, NonceResponse, VerifyResponse } from "./types"

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
 * const { data: nonceData } = await auth.siws.getNonce({
 *   address: walletAddress,
 *   cluster: 'mainnet-beta',
 * })
 *
 * // Sign message with wallet and verify (address and cluster must match)
 * const signature = await wallet.signMessage(
 *   new TextEncoder().encode(nonceData.message),
 * )
 * const { data, error } = await auth.siws.verify({
 *   message: nonceData.message,
 *   signature: bs58.encode(signature),
 *   address: walletAddress,
 *   cluster: 'mainnet-beta',
 * })
 * ```
 */
/** Error body returned by the SIWS endpoints. `code` is a `SiwsPluginErrorCode`. */
type SiwsErrorBody = { code?: string; message?: string }

type SiwsServerPlugin = ReturnType<typeof import("./index").siws>

/**
 * The server plugin as seen by the client. `/siws/verify` is left out of
 * path-based inference because better-auth would retype its top-level `user`
 * field as the User model; `siws.verify` below is typed with `VerifyResponse`.
 */
type SiwsInferServerPlugin = Omit<SiwsServerPlugin, "endpoints"> & {
  endpoints: Omit<SiwsServerPlugin["endpoints"], "verifySiwsMessage">
}

export function siwsClient() {
  return {
    id: "siws",
    $InferServerPlugin: {} as SiwsInferServerPlugin,
    getActions($fetch) {
      return {
        siws: {
          /**
           * Request a nonce and SIWS message to sign.
           */
          getNonce: async (input: { address: string; cluster?: Cluster }) => {
            const response = await $fetch<NonceResponse, SiwsErrorBody>(
              "/siws/nonce",
              {
                method: "POST",
                body: input,
              },
            )
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
            const response = await $fetch<VerifyResponse, SiwsErrorBody>(
              "/siws/verify",
              {
                method: "POST",
                body: input,
              },
            )
            return response
          },
        },
      }
    },
  } satisfies BetterAuthClientPlugin
}

import {
  SiwsMessage,
  SiwsMessageBuilder,
  generateNonce,
  verifySignature,
  SiwsError,
} from '@siws/core'
import { mergeSchema } from 'better-auth/db'
import { setSessionCookie } from 'better-auth/cookies'
import { APIError, createAuthEndpoint } from 'better-auth/api'
import { z } from 'zod'
import { schema } from './schema'
import type { SiwsOptions, Cluster } from './types'

export { schema } from './schema'
export type { SiwsOptions, SolanaAddress, NonceInput, NonceResponse, VerifyInput, VerifyResponse } from './types'
export type { Cluster } from '@siws/core'

export const SiwsPluginErrorCode = {
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_CLUSTER: 'INVALID_CLUSTER',
  NONCE_NOT_FOUND: 'NONCE_NOT_FOUND',
  NONCE_MISMATCH: 'NONCE_MISMATCH',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  EMAIL_REQUIRED: 'EMAIL_REQUIRED',
} as const

const DEFAULT_EXPIRATION_TIME = 300 // 5 minutes
const DEFAULT_CLUSTER: Cluster = 'mainnet-beta'
const DEFAULT_EMAIL_DOMAIN = 'siws.local'

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

function createVerificationKey(address: string, cluster: Cluster): string {
  return `siws:${address}:${cluster}`
}

/**
 * Sign In With Solana plugin for better-auth.
 *
 * Provides batteries-included Solana wallet authentication with full
 * EIP-4361 style messages, domain binding, and expiration.
 *
 * @example
 * ```ts
 * import { betterAuth } from 'better-auth'
 * import { siws } from '@siws/better-auth'
 *
 * const auth = betterAuth({
 *   plugins: [
 *     siws({
 *       statement: 'Sign in to MyApp',
 *       expirationTime: 600, // 10 minutes
 *     }),
 *   ],
 * })
 * ```
 */
export function siws(options?: SiwsOptions) {
  const {
    statement,
    expirationTime = DEFAULT_EXPIRATION_TIME,
    cluster: defaultCluster = DEFAULT_CLUSTER,
    resources,
    emailDomainName = DEFAULT_EMAIL_DOMAIN,
    anonymous = true,
  } = options ?? {}

  return {
    id: 'siws',
    schema: mergeSchema(schema, options?.schema),

    endpoints: {
      getSiwsNonce: createAuthEndpoint(
        '/siws/nonce',
        {
          method: 'POST',
          body: z.object({
            address: z.string().regex(SOLANA_ADDRESS_REGEX),
            cluster: z.enum(['mainnet-beta', 'devnet', 'testnet']).optional().default(defaultCluster),
          }),
        },
        async (ctx) => {
          const address = ctx.body.address
          const cluster = ctx.body.cluster ?? defaultCluster
          const nonce = generateNonce()

          const origin = ctx.request?.headers.get('origin') ?? ctx.request?.headers.get('host') ?? 'localhost'
          const domain = origin.replace(/^https?:\/\//, '').split('/')[0]!
          const uri = ctx.request?.url ?? `https://${domain}`

          const now = new Date()
          const expiration = new Date(now.getTime() + expirationTime * 1000)

          const builder = new SiwsMessageBuilder()
            .domain(domain)
            .address(address)
            .uri(uri)
            .nonce(nonce)
            .issuedAt(now)
            .expirationTime(expiration)
            .cluster(cluster)

          if (statement) {
            builder.statement(statement)
          }

          if (resources && resources.length > 0) {
            builder.resources(resources)
          }

          const siwsMessage = builder.build()
          const message = siwsMessage.toMessage()

          const verificationKey = createVerificationKey(address, cluster)
          await ctx.context.internalAdapter.createVerificationValue({
            identifier: verificationKey,
            value: nonce,
            expiresAt: expiration,
          })

          return ctx.json({ nonce, message })
        }
      ),

      verifySiwsMessage: createAuthEndpoint(
        '/siws/verify',
        {
          method: 'POST',
          body: z.object({
            message: z.string().min(1),
            signature: z.string().min(1),
            address: z.string().regex(SOLANA_ADDRESS_REGEX),
            cluster: z.enum(['mainnet-beta', 'devnet', 'testnet']).optional().default(defaultCluster),
            email: z.email().optional(),
          }).refine(
            (data) => anonymous !== false || !!data.email,
            {
              message: 'Email is required when anonymous mode is disabled',
              path: ['email'],
            }
          ),
          requireRequest: true,
        },
        async (ctx) => {
          const message = ctx.body.message
          const signature = ctx.body.signature
          const address = ctx.body.address
          const cluster = ctx.body.cluster ?? defaultCluster
          const email = ctx.body.email

          try {
            const verificationKey = createVerificationKey(address, cluster)
            const verification = await ctx.context.internalAdapter.findVerificationValue(verificationKey)

            if (!verification || new Date() > verification.expiresAt) {
              throw new APIError('UNAUTHORIZED', {
                message: 'Unauthorized: Invalid or expired nonce',
                status: 401,
                code: 'UNAUTHORIZED_INVALID_OR_EXPIRED_NONCE',
              })
            }

            const { value: nonce } = verification

            let parsedMessage: SiwsMessage
            try {
              parsedMessage = SiwsMessage.parse(message)
            } catch (error) {
              throw new APIError('BAD_REQUEST', {
                code: SiwsPluginErrorCode.VERIFICATION_FAILED,
                message: error instanceof SiwsError ? error.message : 'Failed to parse SIWS message',
              })
            }

            if (parsedMessage.nonce !== nonce) {
              throw new APIError('BAD_REQUEST', {
                code: SiwsPluginErrorCode.NONCE_MISMATCH,
                message: 'Nonce mismatch',
              })
            }

            const origin = ctx.request?.headers.get('origin') ?? ctx.request?.headers.get('host') ?? 'localhost'
            const domain = origin.replace(/^https?:\/\//, '').split('/')[0]!

            const result = await verifySignature(message, signature, address, {
              domain,
              nonce,
            })

            if (!result.success) {
              throw new APIError('UNAUTHORIZED', {
                message: 'Unauthorized: Invalid SIWS signature',
                status: 401,
              })
            }

            await ctx.context.internalAdapter.deleteVerificationValue(verification.id)

            type SolanaAddressRecord = { id: string; userId: string; address: string; cluster: string; isPrimary: boolean; createdAt: Date }
            type UserRecord = { id: string; name: string; email: string; image: string | null; createdAt: Date; updatedAt: Date; emailVerified: boolean }

            let user: UserRecord | null = null

            const existingAddressLink = await ctx.context.adapter.findOne<SolanaAddressRecord>({
              model: 'solanaAddress',
              where: [
                { field: 'address', operator: 'eq', value: address },
                { field: 'cluster', operator: 'eq', value: cluster },
              ],
            })

            if (existingAddressLink) {
              user = await ctx.context.adapter.findOne<UserRecord>({
                model: 'user',
                where: [{ field: 'id', operator: 'eq', value: existingAddressLink.userId }],
              })
            } else {
              const anyAddressLink = await ctx.context.adapter.findOne<SolanaAddressRecord>({
                model: 'solanaAddress',
                where: [{ field: 'address', operator: 'eq', value: address }],
              })

              if (anyAddressLink) {
                user = await ctx.context.adapter.findOne<UserRecord>({
                  model: 'user',
                  where: [{ field: 'id', operator: 'eq', value: anyAddressLink.userId }],
                })
              }
            }

            if (!user) {
              const userEmail = !anonymous && email ? email : `${address}@${emailDomainName}`

              const createdUser = await ctx.context.internalAdapter.createUser({
                name: address,
                email: userEmail,
                image: '',
              })
              user = {
                id: createdUser.id,
                name: createdUser.name ?? address,
                email: createdUser.email,
                image: createdUser.image ?? null,
                createdAt: createdUser.createdAt,
                updatedAt: createdUser.updatedAt,
                emailVerified: createdUser.emailVerified,
              }

              await ctx.context.adapter.create({
                model: 'solanaAddress',
                data: {
                  userId: user.id,
                  address,
                  cluster,
                  isPrimary: true,
                  createdAt: new Date(),
                },
              })

              await ctx.context.internalAdapter.createAccount({
                userId: user.id,
                providerId: 'siws',
                accountId: `${address}:${cluster}`,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
            } else if (!existingAddressLink) {
              await ctx.context.adapter.create({
                model: 'solanaAddress',
                data: {
                  userId: user.id,
                  address,
                  cluster,
                  isPrimary: false,
                  createdAt: new Date(),
                },
              })

              await ctx.context.internalAdapter.createAccount({
                userId: user.id,
                providerId: 'siws',
                accountId: `${address}:${cluster}`,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
            }

            const session = await ctx.context.internalAdapter.createSession(user.id)

            if (!session) {
              throw new APIError('INTERNAL_SERVER_ERROR', {
                message: 'Internal Server Error',
                status: 500,
              })
            }

            await setSessionCookie(ctx, { session, user })

            return ctx.json({
              token: session.token,
              success: true,
              user: {
                id: user.id,
                address,
                cluster,
              },
            })
          } catch (error) {
            if (error instanceof APIError) throw error
            throw new APIError('UNAUTHORIZED', {
              message: 'Something went wrong. Please try again later.',
              error: error instanceof Error ? error.message : 'Unknown error',
              status: 401,
            })
          }
        }
      ),
    },

    options,
  }
}

import {
  SiwsMessage,
  SiwsMessageBuilder,
  generateNonce,
  verifySignature,
  SiwsError,
  SiwsErrorCode,
} from "@siws/core"
import { mergeSchema } from "better-auth/db"
import {
  getCurrentAdapter,
  runWithTransaction,
} from "@better-auth/core/context"
import type { GenericEndpointContext } from "better-auth"
import { setSessionCookie } from "better-auth/cookies"
import { APIError, createAuthEndpoint, isAPIError } from "better-auth/api"
import { z } from "zod"
import { schema } from "./schema"
import type { SiwsOptions, Cluster } from "./types"

export { schema } from "./schema"
export type {
  SiwsOptions,
  SolanaAddress,
  NonceInput,
  NonceResponse,
  VerifyInput,
  VerifyResponse,
} from "./types"
export type { Cluster } from "@siws/core"

/**
 * Error codes returned in the `code` field of SIWS plugin error responses.
 */
export const SiwsPluginErrorCode = {
  /** `address` in the request body is not a valid Solana address. */
  INVALID_ADDRESS: "INVALID_ADDRESS",
  /** `cluster` in the request body is not a supported cluster. */
  INVALID_CLUSTER: "INVALID_CLUSTER",
  /** The submitted message could not be parsed as a SIWS message. */
  INVALID_MESSAGE: "INVALID_MESSAGE",
  /** No unused, unexpired nonce was issued for this address, cluster and nonce. */
  INVALID_OR_EXPIRED_NONCE: "INVALID_OR_EXPIRED_NONCE",
  /** The message domain does not match the configured domain. */
  DOMAIN_MISMATCH: "DOMAIN_MISMATCH",
  /** The message address does not match the `address` in the request body. */
  ADDRESS_MISMATCH: "ADDRESS_MISMATCH",
  /** The message cluster does not match the `cluster` in the request body. */
  CLUSTER_MISMATCH: "CLUSTER_MISMATCH",
  /** The signature is invalid or the message failed verification. */
  VERIFICATION_FAILED: "VERIFICATION_FAILED",
  /** `email` is required because `anonymous` is `false`. */
  EMAIL_REQUIRED: "EMAIL_REQUIRED",
  /** A user with the submitted `email` already exists. */
  EMAIL_ALREADY_IN_USE: "EMAIL_ALREADY_IN_USE",
  /** The domain/URI could not be determined from the plugin or better-auth config. */
  DOMAIN_NOT_CONFIGURED: "DOMAIN_NOT_CONFIGURED",
} as const

type SiwsPluginErrorCode =
  (typeof SiwsPluginErrorCode)[keyof typeof SiwsPluginErrorCode]

const ERROR_MESSAGES: Record<SiwsPluginErrorCode, string> = {
  INVALID_ADDRESS: "Invalid Solana address",
  INVALID_CLUSTER: "Invalid cluster. Expected mainnet-beta, devnet or testnet",
  INVALID_MESSAGE: "Failed to parse SIWS message",
  INVALID_OR_EXPIRED_NONCE: "Invalid or expired nonce",
  DOMAIN_MISMATCH: "Message domain does not match",
  ADDRESS_MISMATCH: "Message address does not match the request address",
  CLUSTER_MISMATCH: "Message cluster does not match the request cluster",
  VERIFICATION_FAILED: "Invalid SIWS signature",
  EMAIL_REQUIRED: "Email is required when anonymous mode is disabled",
  EMAIL_ALREADY_IN_USE: "A user with this email already exists",
  DOMAIN_NOT_CONFIGURED:
    "[siws] Could not determine the SIWS domain. Set the better-auth `baseURL` option (or the BETTER_AUTH_URL environment variable), or pass `domain` and `uri` to siws().",
}

/**
 * The plugin's error codes in better-auth's `$ERROR_CODES` shape
 * (`{ code, message }` per code).
 */
export const SIWS_ERROR_CODES = Object.fromEntries(
  Object.values(SiwsPluginErrorCode).map((code) => [
    code,
    { code, message: ERROR_MESSAGES[code] },
  ]),
) as { [K in SiwsPluginErrorCode]: { readonly code: K; message: string } }

function siwsError(
  status: ConstructorParameters<typeof APIError>[0],
  code: SiwsPluginErrorCode,
): APIError {
  return APIError.from(status, SIWS_ERROR_CODES[code])
}

/** AuthContext key holding the base URL configured at startup (not per request). */
const CONFIGURED_BASE_URL_KEY = "siwsConfiguredBaseURL"

const DEFAULT_EXPIRATION_TIME = 300 // 5 minutes
const DEFAULT_CLUSTER: Cluster = "mainnet-beta"
const DEFAULT_EMAIL_DOMAIN = "siws.local"
const CLUSTERS = ["mainnet-beta", "devnet", "testnet"] as const
/** Valid placeholder address (32 zero bytes) used to validate options at startup. */
const PROBE_ADDRESS = "11111111111111111111111111111111"

// Cheap pre-filter (Base58, 32–44 chars). The authoritative check is
// @siws/core's address validation, applied when the message is built/parsed.
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

function invalidAddressError(): APIError {
  return siwsError("BAD_REQUEST", SiwsPluginErrorCode.INVALID_ADDRESS)
}

function createVerificationKey(
  address: string,
  cluster: Cluster,
  nonce: string,
): string {
  return `siws:${address}:${cluster}:${nonce}`
}

type SolanaAddressRecord = {
  id: string
  userId: string
  address: string
  cluster: string
  isPrimary: boolean
  createdAt: Date
}

type SiwsUser = {
  id: string
  name: string
  email: string
  image?: string | null
  createdAt: Date
  updatedAt: Date
  emailVerified: boolean
}

/**
 * Finds the user linked to `address` (on any cluster) or creates one, and
 * makes sure an (address, cluster) link exists.
 *
 * All writes run in one transaction. Two concurrent first sign-ins for the
 * same wallet or email race on database unique constraints (the
 * solanaAddress (address, cluster) index and user.email): the loser's
 * transaction rolls back and it retries once, which then finds the winner's
 * rows and signs into the same user (or reports EMAIL_ALREADY_IN_USE).
 */
async function findOrCreateUser(
  ctx: GenericEndpointContext,
  input: {
    address: string
    cluster: Cluster
    /** Set only when anonymous mode is disabled. */
    email: string | undefined
    emailDomainName: string
  },
): Promise<SiwsUser> {
  const attempt = () =>
    runWithTransaction(ctx.context.adapter, async () => {
      const adapter = await getCurrentAdapter(ctx.context.adapter)
      const { address, cluster, email } = input

      const links = await adapter.findMany<SolanaAddressRecord>({
        model: "solanaAddress",
        where: [{ field: "address", operator: "eq", value: address }],
      })
      const exactLink = links.find((link) => link.cluster === cluster)
      const existingLink = exactLink ?? links[0]

      if (existingLink) {
        const user = await adapter.findOne<SiwsUser>({
          model: "user",
          where: [{ field: "id", operator: "eq", value: existingLink.userId }],
        })
        if (!user) {
          throw new Error(
            `solanaAddress ${existingLink.id} references a missing user`,
          )
        }
        if (!exactLink) {
          await linkAddress(ctx, adapter, user.id, address, cluster, false)
        }
        return user
      }

      if (email) {
        const existingUser =
          await ctx.context.internalAdapter.findUserByEmail(email)
        if (existingUser) {
          throw siwsError(
            "UNPROCESSABLE_ENTITY",
            SiwsPluginErrorCode.EMAIL_ALREADY_IN_USE,
          )
        }
      }

      const user: SiwsUser = await ctx.context.internalAdapter.createUser(
        {
          name: address,
          email: email ?? `${address}@${input.emailDomainName}`,
          image: "",
        },
        { method: "siws" },
      )
      await linkAddress(ctx, adapter, user.id, address, cluster, true)
      return user
    })

  try {
    return await attempt()
  } catch (error) {
    if (isAPIError(error)) throw error
    // Most likely a unique-constraint violation from a concurrent sign-in
    // that committed first. Our transaction rolled back; retry once.
    return attempt()
  }
}

async function linkAddress(
  ctx: GenericEndpointContext,
  adapter: Awaited<ReturnType<typeof getCurrentAdapter>>,
  userId: string,
  address: string,
  cluster: Cluster,
  isPrimary: boolean,
): Promise<void> {
  const now = new Date()
  await adapter.create({
    model: "solanaAddress",
    data: { userId, address, cluster, isPrimary, createdAt: now },
  })
  await ctx.context.internalAdapter.createAccount({
    userId,
    providerId: "siws",
    accountId: `${address}:${cluster}`,
    createdAt: now,
    updatedAt: now,
  })
}

type ValidationIssue = {
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>
}

/**
 * Maps body validation failures on `address` / `cluster` to plugin error codes
 * (otherwise better-call reports a generic `VALIDATION_ERROR`).
 */
function onValidationError({
  issues,
}: {
  issues: readonly ValidationIssue[]
}): void {
  for (const issue of issues) {
    const segment = issue.path?.[0]
    const field = typeof segment === "object" ? segment.key : segment
    if (field === "address") {
      throw invalidAddressError()
    }
    if (field === "cluster") {
      throw siwsError("BAD_REQUEST", SiwsPluginErrorCode.INVALID_CLUSTER)
    }
  }
}

function assertValidOptions(options: SiwsOptions | undefined): void {
  if (options?.domain !== undefined) {
    const { domain } = options
    if (!domain || /[/\s]/.test(domain)) {
      throw new Error(
        `[siws] Invalid \`domain\` option "${domain}": expected an RFC 3986 authority such as "example.com" or "localhost:3000", not a URL.`,
      )
    }
  }
  if (options?.uri !== undefined) {
    try {
      new URL(options.uri)
    } catch {
      throw new Error(
        `[siws] Invalid \`uri\` option "${options.uri}": expected an absolute URI such as "https://example.com".`,
      )
    }
  }

  // Run the options that end up in every message through @siws/core's own
  // validation now, so a bad value fails at startup instead of turning every
  // /siws/nonce request into a 500.
  try {
    const probe = new SiwsMessageBuilder()
      .domain(options?.domain ?? "localhost")
      .address(PROBE_ADDRESS)
      .uri(options?.uri ?? "https://localhost")
      .nonce(generateNonce())
      .issuedAt(new Date())
      .cluster(options?.cluster ?? DEFAULT_CLUSTER)
    if (options?.statement) probe.statement(options.statement)
    if (options?.resources && options.resources.length > 0) {
      probe.resources(options.resources)
    }
    probe.build()
  } catch (error) {
    if (error instanceof SiwsError) {
      throw new Error(`[siws] Invalid option: ${error.message}`)
    }
    throw error
  }
}

function parseURL(value: unknown): URL | null {
  if (typeof value !== "string" || value.length === 0) return null
  try {
    return new URL(value)
  } catch {
    return null
  }
}

/**
 * Sign In With Solana plugin for better-auth.
 *
 * Provides batteries-included Solana wallet authentication with full
 * EIP-4361 style messages, domain binding, and expiration.
 *
 * The message domain and URI come from the `domain` / `uri` options, or
 * default to the better-auth `baseURL`. They are never read from request
 * headers.
 *
 * @example
 * ```ts
 * import { betterAuth } from 'better-auth'
 * import { siws } from '@siws/better-auth'
 *
 * const auth = betterAuth({
 *   baseURL: 'https://example.com',
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
  assertValidOptions(options)

  const {
    statement,
    expirationTime = DEFAULT_EXPIRATION_TIME,
    cluster: defaultCluster = DEFAULT_CLUSTER,
    resources,
    emailDomainName = DEFAULT_EMAIL_DOMAIN,
    anonymous = true,
    domain: configuredDomain,
    uri: configuredUri,
  } = options ?? {}

  /**
   * Resolves the domain and URI to bind messages to. Uses only server-side
   * configuration: the plugin options, or the base URL better-auth resolved
   * at startup from its `baseURL` option / BETTER_AUTH_URL (captured in
   * `init`). Never `ctx.context.baseURL` or `ctx.context.options.baseURL` at
   * request time: when no base URL is configured, better-auth fills those in
   * from the request (Host header) on every call.
   */
  function resolveMessageContext(ctx: { context: object }): {
    domain: string
    uri: string
  } {
    if (configuredDomain && configuredUri) {
      return { domain: configuredDomain, uri: configuredUri }
    }

    const baseURL = parseURL(
      (ctx.context as Record<string, unknown>)[CONFIGURED_BASE_URL_KEY],
    )

    if (!baseURL) {
      throw siwsError(
        "INTERNAL_SERVER_ERROR",
        SiwsPluginErrorCode.DOMAIN_NOT_CONFIGURED,
      )
    }

    return {
      domain: configuredDomain ?? baseURL.host,
      uri: configuredUri ?? baseURL.origin,
    }
  }

  const clusterSchema = z.enum(CLUSTERS).optional().default(defaultCluster)
  const addressSchema = z.string().regex(SOLANA_ADDRESS_REGEX)

  return {
    id: "siws",
    schema: mergeSchema(schema, options?.schema),
    $ERROR_CODES: SIWS_ERROR_CODES,

    init(ctx: {
      options: { baseURL?: unknown }
      logger?: { error: (message: string) => void }
    }) {
      // At init time `options.baseURL` holds only what was configured (the
      // option or BETTER_AUTH_URL, normalised to an origin) or "". A dynamic
      // baseURL config object counts as not configured.
      const baseURL = ctx.options.baseURL
      const configuredBaseURL =
        typeof baseURL === "string" && baseURL.length > 0 ? baseURL : null
      if (
        !(configuredDomain && configuredUri) &&
        !parseURL(configuredBaseURL)
      ) {
        // Surface the misconfiguration at startup; every SIWS request would
        // otherwise fail with DOMAIN_NOT_CONFIGURED.
        ctx.logger?.error(ERROR_MESSAGES.DOMAIN_NOT_CONFIGURED)
      }
      return {
        context: {
          [CONFIGURED_BASE_URL_KEY]: configuredBaseURL,
        },
      }
    },

    endpoints: {
      getSiwsNonce: createAuthEndpoint(
        "/siws/nonce",
        {
          method: "POST",
          body: z.object({
            address: addressSchema,
            cluster: clusterSchema,
          }),
          onValidationError,
        },
        async (ctx) => {
          const address = ctx.body.address
          const cluster = ctx.body.cluster
          const { domain, uri } = resolveMessageContext(ctx)
          const nonce = generateNonce()

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

          let message: string
          try {
            message = builder.build().toMessage()
          } catch (error) {
            // Core rejects addresses that pass the regex but are not valid
            // 32-byte public keys.
            if (
              error instanceof SiwsError &&
              error.code === SiwsErrorCode.INVALID_ADDRESS
            ) {
              throw invalidAddressError()
            }
            throw error
          }

          await ctx.context.internalAdapter.createVerificationValue({
            identifier: createVerificationKey(address, cluster, nonce),
            value: nonce,
            expiresAt: expiration,
          })

          return ctx.json({ nonce, message })
        },
      ),

      verifySiwsMessage: createAuthEndpoint(
        "/siws/verify",
        {
          method: "POST",
          body: z.object({
            message: z.string().min(1),
            signature: z.string().min(1),
            address: addressSchema,
            cluster: clusterSchema,
            email: z.email().optional(),
          }),
          onValidationError,
        },
        async (ctx) => {
          const message = ctx.body.message
          const signature = ctx.body.signature
          const address = ctx.body.address
          const cluster = ctx.body.cluster
          const email = ctx.body.email

          if (!anonymous && !email) {
            throw siwsError("BAD_REQUEST", SiwsPluginErrorCode.EMAIL_REQUIRED)
          }

          const { domain } = resolveMessageContext(ctx)

          try {
            let parsedMessage: SiwsMessage
            try {
              parsedMessage = SiwsMessage.parse(message)
            } catch (error) {
              throw new APIError("BAD_REQUEST", {
                code: SiwsPluginErrorCode.INVALID_MESSAGE,
                message:
                  error instanceof SiwsError
                    ? error.message
                    : ERROR_MESSAGES.INVALID_MESSAGE,
              })
            }

            if (parsedMessage.address !== address) {
              throw siwsError(
                "UNAUTHORIZED",
                SiwsPluginErrorCode.ADDRESS_MISMATCH,
              )
            }

            if (parsedMessage.cluster !== cluster) {
              throw siwsError(
                "UNAUTHORIZED",
                SiwsPluginErrorCode.CLUSTER_MISMATCH,
              )
            }

            // Atomically consume the nonce: only the first concurrent request
            // gets the row, it is single use even if verification below
            // fails, and expired rows come back as null.
            const verification =
              await ctx.context.internalAdapter.consumeVerificationValue(
                createVerificationKey(address, cluster, parsedMessage.nonce),
              )

            if (!verification) {
              throw siwsError(
                "UNAUTHORIZED",
                SiwsPluginErrorCode.INVALID_OR_EXPIRED_NONCE,
              )
            }

            // The lookup key contains the message nonce, so the stored value
            // always equals it; verifySignature re-checks it below anyway.
            const nonce = verification.value

            if (parsedMessage.domain !== domain) {
              throw siwsError(
                "UNAUTHORIZED",
                SiwsPluginErrorCode.DOMAIN_MISMATCH,
              )
            }

            const result = await verifySignature(
              parsedMessage,
              signature,
              address,
              {
                domain,
                nonce,
              },
            )

            if (!result.success) {
              throw siwsError(
                "UNAUTHORIZED",
                SiwsPluginErrorCode.VERIFICATION_FAILED,
              )
            }

            const user = await findOrCreateUser(ctx, {
              address,
              cluster,
              email: !anonymous ? email : undefined,
              emailDomainName,
            })

            const session = await ctx.context.internalAdapter.createSession(
              user.id,
            )

            if (!session) {
              throw new Error("Failed to create session")
            }

            await setSessionCookie(ctx, { session, user })

            return ctx.json({
              token: session.token,
              success: true as const,
              user: {
                id: user.id,
                address,
                cluster,
              },
            })
          } catch (error) {
            if (isAPIError(error)) throw error
            ctx.context.logger?.error(
              "[siws] Unexpected error while verifying SIWS message",
              error,
            )
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Something went wrong. Please try again later.",
            })
          }
        },
      ),
    },

    options,
  }
}

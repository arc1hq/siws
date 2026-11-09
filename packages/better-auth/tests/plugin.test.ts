import { describe, it, expect, expectTypeOf } from "vitest"
import type { BetterAuthPlugin } from "better-auth"
import type { BetterAuthClientPlugin } from "better-auth/client"
import { createAuthClient } from "better-auth/client"
import { siws, SiwsPluginErrorCode, SIWS_ERROR_CODES, schema } from "@/index"
import { siwsClient } from "@/client"
import type {
  Cluster,
  SiwsOptions,
  SolanaAddress,
  NonceInput,
  VerifyInput,
} from "@/types"

const VALID_ADDRESS = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"

describe("siws plugin", () => {
  describe("plugin factory", () => {
    it("creates plugin with default options", () => {
      const plugin = siws()

      expect(plugin.id).toBe("siws")
      expect(plugin.schema).toBeDefined()
      expect(plugin.endpoints).toBeDefined()
      expect(plugin.endpoints.getSiwsNonce).toBeDefined()
      expect(plugin.endpoints.verifySiwsMessage).toBeDefined()
    })

    it("creates plugin with custom options", () => {
      const options: SiwsOptions = {
        statement: "Sign in to MyApp",
        expirationTime: 600,
        cluster: "devnet",
        resources: ["https://example.com/api"],
        emailDomainName: "myapp.local",
        anonymous: false,
        domain: "example.com",
        uri: "https://example.com",
      }

      const plugin = siws(options)

      expect(plugin.id).toBe("siws")
      expect(plugin.schema).toBeDefined()
      expect(plugin.options).toEqual(options)
    })

    it("creates plugin with schema overrides", () => {
      const options: SiwsOptions = {
        schema: {
          solanaAddress: {
            modelName: "wallet_address",
          },
        },
      }

      const plugin = siws(options)

      expect(plugin.id).toBe("siws")
      expect(plugin.schema).toBeDefined()
    })
  })

  describe("error codes", () => {
    it("exports every error code with its own name as value", () => {
      expect(Object.keys(SiwsPluginErrorCode).sort()).toEqual(
        [
          "ADDRESS_MISMATCH",
          "CLUSTER_MISMATCH",
          "DOMAIN_MISMATCH",
          "DOMAIN_NOT_CONFIGURED",
          "EMAIL_ALREADY_IN_USE",
          "EMAIL_REQUIRED",
          "INVALID_ADDRESS",
          "INVALID_CLUSTER",
          "INVALID_MESSAGE",
          "INVALID_OR_EXPIRED_NONCE",
          "VERIFICATION_FAILED",
        ].sort(),
      )
      for (const [key, value] of Object.entries(SiwsPluginErrorCode)) {
        expect(value).toBe(key)
      }
    })

    it("registers error codes on the plugin in better-auth's shape", () => {
      const { $ERROR_CODES } = siws()
      expect($ERROR_CODES).toBe(SIWS_ERROR_CODES)
      for (const code of Object.values(SiwsPluginErrorCode)) {
        expect($ERROR_CODES[code].code).toBe(code)
        expect($ERROR_CODES[code].message).toEqual(expect.any(String))
      }
    })
  })
})

describe("schema", () => {
  it("defines solanaAddress table", () => {
    expect(schema.solanaAddress).toBeDefined()
    expect(schema.solanaAddress.fields).toBeDefined()
  })

  it("has required fields", () => {
    const { fields } = schema.solanaAddress

    expect(fields.userId).toBeDefined()
    expect(fields.userId.type).toBe("string")
    expect(fields.userId.required).toBe(true)
    expect(fields.userId.references).toEqual({
      model: "user",
      field: "id",
      onDelete: "cascade",
    })

    expect(fields.address).toBeDefined()
    expect(fields.address.type).toBe("string")
    expect(fields.address.required).toBe(true)

    expect(fields.cluster).toBeDefined()
    expect(fields.cluster.type).toBe("string")
    expect(fields.cluster.required).toBe(true)

    expect(fields.isPrimary).toBeDefined()
    expect(fields.isPrimary.type).toBe("boolean")
    expect(fields.isPrimary.defaultValue).toBe(false)

    expect(fields.createdAt).toBeDefined()
    expect(fields.createdAt.type).toBe("date")
    expect(fields.createdAt.required).toBe(true)
  })
})

describe("siwsClient", () => {
  it("creates client plugin", () => {
    const client = siwsClient()

    expect(client.id).toBe("siws")
    expect(client.getActions).toBeDefined()
  })

  it("client getActions returns siws namespace", () => {
    const client = siwsClient()
    const mockFetch = async () => ({})
    const actions = client.getActions(mockFetch as never)

    expect(actions.siws).toBeDefined()
    expect(typeof actions.siws.getNonce).toBe("function")
    expect(typeof actions.siws.verify).toBe("function")
  })
})

describe("types", () => {
  it("SolanaAddress has correct shape", () => {
    const address: SolanaAddress = {
      id: "123",
      userId: "user_123",
      address: VALID_ADDRESS,
      cluster: "mainnet-beta",
      isPrimary: true,
      createdAt: new Date(),
    }

    expect(address.id).toBe("123")
    expect(address.userId).toBe("user_123")
    expect(address.address).toBe(VALID_ADDRESS)
    expect(address.cluster).toBe("mainnet-beta")
    expect(address.isPrimary).toBe(true)
    expect(address.createdAt).toBeInstanceOf(Date)
  })

  it("NonceInput has correct shape", () => {
    const input: NonceInput = {
      address: VALID_ADDRESS,
      cluster: "devnet",
    }

    expect(input.address).toBe(VALID_ADDRESS)
    expect(input.cluster).toBe("devnet")
  })

  it("VerifyInput has correct shape", () => {
    const input: VerifyInput = {
      message: "example.com wants you to sign in...",
      signature: "abc123",
      address: VALID_ADDRESS,
      cluster: "mainnet-beta",
      email: "user@example.com",
    }

    expect(input.message).toBeDefined()
    expect(input.signature).toBe("abc123")
    expect(input.address).toBe(VALID_ADDRESS)
    expect(input.cluster).toBe("mainnet-beta")
    expect(input.email).toBe("user@example.com")
  })
})

describe("type inference", () => {
  it("siws() is a BetterAuthPlugin and siwsClient() a client plugin", () => {
    expectTypeOf(siws()).toExtend<BetterAuthPlugin>()
    expectTypeOf(siwsClient()).toExtend<BetterAuthClientPlugin>()
  })

  it("client actions return the plugin's response types", () => {
    const client = createAuthClient({
      baseURL: "https://example.com",
      plugins: [siwsClient()],
    })
    expect(typeof client.siws.verify).toBe("function")
    type VerifyResult = Awaited<ReturnType<typeof client.siws.verify>>
    type NonceResult = Awaited<ReturnType<typeof client.siws.getNonce>>

    expectTypeOf<NonNullable<VerifyResult["data"]>["user"]>().toEqualTypeOf<{
      id: string
      address: string
      cluster: Cluster
    }>()
    expectTypeOf<NonNullable<VerifyResult["error"]>["code"]>().toEqualTypeOf<
      string | undefined
    >()
    expectTypeOf<NonNullable<NonceResult["data"]>>().toEqualTypeOf<{
      nonce: string
      message: string
    }>()
  })
})

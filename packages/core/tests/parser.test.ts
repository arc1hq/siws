import { describe, it, expect } from 'vitest'
import { parseMessage } from '@/parser'
import { SiwsError, SiwsErrorCode } from '@/errors'

const VALID_ADDRESS = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

describe('parseMessage', () => {
  describe('valid messages', () => {
    it('parses minimal message with statement', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Sign in to Example

URI: https://example.com/auth
Version: 1
Nonce: k8sj2n4b
Issued At: 2024-01-15T12:00:00Z`

      const result = parseMessage(message)

      expect(result.domain).toBe('example.com')
      expect(result.address).toBe(VALID_ADDRESS)
      expect(result.statement).toBe('Sign in to Example')
      expect(result.uri).toBe('https://example.com/auth')
      expect(result.version).toBe('1')
      expect(result.nonce).toBe('k8sj2n4b')
      expect(result.issuedAt).toBe('2024-01-15T12:00:00Z')
      expect(result.expirationTime).toBeUndefined()
      expect(result.notBefore).toBeUndefined()
      expect(result.requestId).toBeUndefined()
      expect(result.cluster).toBeUndefined()
      expect(result.resources).toBeUndefined()
    })

    it('parses message without statement', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: k8sj2n4b
Issued At: 2024-01-15T12:00:00Z`

      const result = parseMessage(message)

      expect(result.domain).toBe('example.com')
      expect(result.address).toBe(VALID_ADDRESS)
      expect(result.statement).toBeUndefined()
      expect(result.uri).toBe('https://example.com/auth')
      expect(result.version).toBe('1')
      expect(result.nonce).toBe('k8sj2n4b')
      expect(result.issuedAt).toBe('2024-01-15T12:00:00Z')
    })

    it('parses complete message with all fields', () => {
      const message = `app.example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

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
- https://app.example.com/api/settings`

      const result = parseMessage(message)

      expect(result.domain).toBe('app.example.com')
      expect(result.address).toBe(VALID_ADDRESS)
      expect(result.statement).toBe('Access your dashboard and manage settings.')
      expect(result.uri).toBe('https://app.example.com/api/auth')
      expect(result.version).toBe('1')
      expect(result.nonce).toBe('f7k2m9p4x1')
      expect(result.issuedAt).toBe('2024-01-15T12:00:00.000Z')
      expect(result.expirationTime).toBe('2024-01-15T12:10:00.000Z')
      expect(result.notBefore).toBe('2024-01-15T12:00:00.000Z')
      expect(result.requestId).toBe('req_abc123')
      expect(result.cluster).toBe('mainnet-beta')
      expect(result.resources).toEqual([
        'https://app.example.com/api/profile',
        'https://app.example.com/api/settings',
      ])
    })

    it('parses message with localhost domain', () => {
      const message = `localhost:3000 wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: http://localhost:3000/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      const result = parseMessage(message)

      expect(result.domain).toBe('localhost:3000')
    })

    it('parses message with devnet cluster', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: devnet`

      const result = parseMessage(message)

      expect(result.cluster).toBe('devnet')
    })

    it('parses message with testnet cluster', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: testnet`

      const result = parseMessage(message)

      expect(result.cluster).toBe('testnet')
    })

    it('parses message with single resource', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Resources:
- https://example.com/api/resource`

      const result = parseMessage(message)

      expect(result.resources).toEqual(['https://example.com/api/resource'])
    })

    it('parses message with milliseconds in timestamp', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00.123Z`

      const result = parseMessage(message)

      expect(result.issuedAt).toBe('2024-01-15T12:00:00.123Z')
    })
  })

  describe('invalid messages', () => {
    it('throws on message too short', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow('Message is too short')
    })

    it('throws on missing domain line suffix', () => {
      const message = `example.com wants you to sign in:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow('missing domain line')
    })

    it('throws on empty address', () => {
      const message = `example.com wants you to sign in with your Solana account:

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow('missing address')
    })

    it('throws on missing URI field', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow('Missing required field: URI')
    })

    it('throws on missing Version field', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow('Missing required field: Version')
    })

    it('throws on missing Nonce field', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow('Missing required field: Nonce')
    })

    it('throws on missing Issued At field', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow('Missing required field: Issued At')
    })

    it('throws on multiline statement', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Line one
Line two

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow('Statement must be a single line')
    })

    it('throws on invalid cluster', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Cluster: invalid-cluster`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      try {
        parseMessage(message)
      } catch (error) {
        expect(error).toBeInstanceOf(SiwsError)
        expect((error as SiwsError).code).toBe(SiwsErrorCode.INVALID_CLUSTER)
      }
    })

    it('throws on malformed resource line', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Resources:
https://example.com/api/resource`

      expect(() => parseMessage(message)).toThrow(SiwsError)
      expect(() => parseMessage(message)).toThrow('must start with "- "')
    })
  })

  describe('edge cases', () => {
    it('handles empty resources section', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Resources:`

      const result = parseMessage(message)

      expect(result.resources).toBeUndefined()
    })

    it('handles statement with special characters', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

Sign in to access $100 worth of tokens! (Limited time offer)

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z`

      const result = parseMessage(message)

      expect(result.statement).toBe('Sign in to access $100 worth of tokens! (Limited time offer)')
    })

    it('handles request ID with special characters', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Version: 1
Nonce: abcd1234
Issued At: 2024-01-15T12:00:00Z
Request ID: req-123_abc.456`

      const result = parseMessage(message)

      expect(result.requestId).toBe('req-123_abc.456')
    })

    it('preserves field order independence', () => {
      const message = `example.com wants you to sign in with your Solana account:
${VALID_ADDRESS}

URI: https://example.com/auth
Nonce: abcd1234
Version: 1
Issued At: 2024-01-15T12:00:00Z`

      const result = parseMessage(message)

      expect(result.uri).toBe('https://example.com/auth')
      expect(result.nonce).toBe('abcd1234')
      expect(result.version).toBe('1')
    })
  })
})

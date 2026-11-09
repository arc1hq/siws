import { ed25519 } from "@noble/curves/ed25519"
import { decodeBase58, stringToBytes, isExpired, isNotYetValid } from "@/utils"
import { SiwsError, SiwsErrorCode } from "@/errors"
import { SiwsMessage } from "@/message"
import type { VerificationOptions, VerificationResult } from "@/types"
import { SIGNATURE_BYTE_LENGTH, PUBLIC_KEY_BYTE_LENGTH } from "@/constants"

function validateVerificationContext(
  message: SiwsMessage,
  options?: VerificationOptions,
): void {
  const now = options?.time ?? new Date()

  if (options?.domain && message.domain !== options.domain) {
    throw new SiwsError(
      SiwsErrorCode.DOMAIN_MISMATCH,
      "Domain mismatch",
      options.domain,
      message.domain,
    )
  }

  if (options?.nonce && message.nonce !== options.nonce) {
    throw new SiwsError(
      SiwsErrorCode.NONCE_MISMATCH,
      "Nonce mismatch",
      options.nonce,
      message.nonce,
    )
  }

  if (message.expirationTime && isExpired(message.expirationTime, now)) {
    throw new SiwsError(SiwsErrorCode.MESSAGE_EXPIRED, "Message has expired")
  }

  if (message.notBefore && isNotYetValid(message.notBefore, now)) {
    throw new SiwsError(
      SiwsErrorCode.MESSAGE_NOT_YET_VALID,
      "Message is not yet valid",
    )
  }
}

/**
 * Verify a Base58 Ed25519 signature over a SIWS message.
 *
 * Steps: parse the message strictly (canonical form only), check the
 * optional `domain` / `nonce` and the `expirationTime` / `notBefore` window,
 * then verify the signature against the message `address`. Never throws;
 * failures are returned as `{ success: false, error }`.
 *
 * **Security:** `options.domain` and `options.nonce` are optional, but
 * omitting `domain` disables domain binding (signatures made for another site
 * are accepted) and omitting `nonce` disables replay protection. Relying
 * parties should pass both, using a server-issued, single-use nonce.
 *
 * @param message Raw message string (exact signed bytes) or a `SiwsMessage`.
 * @param signature Base58-encoded 64-byte Ed25519 signature.
 * @param publicKey Optional Base58 public key, e.g. the address the client
 *   claims. If given it must equal the message `address`, otherwise the result
 *   is an `INVALID_ADDRESS` failure. Defaults to the message `address`.
 * @param options Domain / nonce / time checks. See `VerificationOptions`.
 */
export async function verifySignature(
  message: string | SiwsMessage,
  signature: string,
  publicKey?: string,
  options?: VerificationOptions,
): Promise<VerificationResult> {
  try {
    const siwsMessage =
      message instanceof SiwsMessage ? message : SiwsMessage.parse(message)
    const messageString =
      message instanceof SiwsMessage ? message.toMessage() : message

    // The signer must be the account named in the message. Without this check
    // an attacker could sign a message naming a victim's address with their
    // own key and get back `data.address === victim`.
    if (publicKey !== undefined && publicKey !== siwsMessage.address) {
      throw new SiwsError(
        SiwsErrorCode.INVALID_ADDRESS,
        "Public key does not match message address",
        siwsMessage.address,
        publicKey,
      )
    }
    const resolvedPublicKey = siwsMessage.address

    validateVerificationContext(siwsMessage, options)

    let signatureBytes: Uint8Array
    try {
      signatureBytes = decodeBase58(signature)
    } catch {
      throw new SiwsError(
        SiwsErrorCode.INVALID_SIGNATURE,
        "Invalid signature: not valid Base58",
      )
    }

    if (signatureBytes.length !== SIGNATURE_BYTE_LENGTH) {
      throw new SiwsError(
        SiwsErrorCode.INVALID_SIGNATURE,
        `Invalid signature length: expected ${SIGNATURE_BYTE_LENGTH}, got ${signatureBytes.length}`,
      )
    }

    let publicKeyBytes: Uint8Array
    try {
      publicKeyBytes = decodeBase58(resolvedPublicKey)
    } catch {
      throw new SiwsError(
        SiwsErrorCode.INVALID_ADDRESS,
        "Invalid public key: not valid Base58",
      )
    }

    if (publicKeyBytes.length !== PUBLIC_KEY_BYTE_LENGTH) {
      throw new SiwsError(
        SiwsErrorCode.INVALID_ADDRESS,
        `Invalid public key length: expected ${PUBLIC_KEY_BYTE_LENGTH}, got ${publicKeyBytes.length}`,
      )
    }

    const messageBytes = stringToBytes(messageString)
    const isValid = ed25519.verify(signatureBytes, messageBytes, publicKeyBytes)

    if (!isValid) {
      throw new SiwsError(
        SiwsErrorCode.SIGNATURE_VERIFICATION_FAILED,
        "Signature verification failed",
      )
    }

    return {
      success: true,
      data: siwsMessage.toFields(),
    }
  } catch (error) {
    if (error instanceof SiwsError) {
      return { success: false, error }
    }
    const siwsError = new SiwsError(
      SiwsErrorCode.SIGNATURE_VERIFICATION_FAILED,
      error instanceof Error ? error.message : "Unknown error",
    )
    siwsError.cause = error
    return { success: false, error: siwsError }
  }
}

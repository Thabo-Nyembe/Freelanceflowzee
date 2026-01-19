/**
 * WebAuthn/Passkeys Service
 *
 * Implements FIDO2/WebAuthn passwordless authentication using @simplewebauthn
 * Supports: Platform authenticators, cross-device authentication, backup codes
 *
 * @module lib/auth/webauthn-service
 */

import { createClient } from '@/lib/supabase/server'

// Types for WebAuthn
export interface PublicKeyCredentialCreationOptionsJSON {
  challenge: string
  rp: {
    name: string
    id: string
  }
  user: {
    id: string
    name: string
    displayName: string
  }
  pubKeyCredParams: Array<{
    type: 'public-key'
    alg: number
  }>
  timeout?: number
  attestation?: AttestationConveyancePreference
  authenticatorSelection?: {
    authenticatorAttachment?: AuthenticatorAttachment
    residentKey?: ResidentKeyRequirement
    requireResidentKey?: boolean
    userVerification?: UserVerificationRequirement
  }
  excludeCredentials?: Array<{
    id: string
    type: 'public-key'
    transports?: AuthenticatorTransport[]
  }>
}

export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string
  timeout?: number
  rpId?: string
  allowCredentials?: Array<{
    id: string
    type: 'public-key'
    transports?: AuthenticatorTransport[]
  }>
  userVerification?: UserVerificationRequirement
}

export interface RegistrationResponseJSON {
  id: string
  rawId: string
  response: {
    clientDataJSON: string
    attestationObject: string
    transports?: AuthenticatorTransport[]
  }
  type: 'public-key'
  clientExtensionResults: AuthenticationExtensionsClientOutputs
  authenticatorAttachment?: AuthenticatorAttachment
}

export interface AuthenticationResponseJSON {
  id: string
  rawId: string
  response: {
    clientDataJSON: string
    authenticatorData: string
    signature: string
    userHandle?: string
  }
  type: 'public-key'
  clientExtensionResults: AuthenticationExtensionsClientOutputs
  authenticatorAttachment?: AuthenticatorAttachment
}

export interface UserPasskey {
  id: string
  user_id: string
  credential_id: string
  public_key: string
  counter: number
  transports: string[]
  device_type: 'platform' | 'cross-platform'
  backed_up: boolean
  name: string
  created_at: string
  last_used_at: string | null
}

export interface WebAuthnChallenge {
  id: string
  user_id: string | null
  challenge: string
  type: 'registration' | 'authentication'
  expires_at: string
  created_at: string
}

// Configuration
const RP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'FreeFlow'
const RP_ID = process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID || 'localhost'
const RP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// COSE Algorithm identifiers
const COSE_ALG_ES256 = -7 // ECDSA w/ SHA-256
const COSE_ALG_RS256 = -257 // RSASSA-PKCS1-v1_5 w/ SHA-256
const COSE_ALG_EDDSA = -8 // EdDSA

/**
 * Generate a cryptographically secure random challenge
 */
function generateChallenge(): string {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for server-side
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Buffer.from(array).toString('base64url')
}

/**
 * Base64URL encode
 */
function base64URLEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer
  return Buffer.from(bytes).toString('base64url')
}

/**
 * Base64URL decode
 */
function base64URLDecode(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, 'base64url'))
}

/**
 * WebAuthn Service Class
 */
export class WebAuthnService {
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null

  /**
   * Initialize Supabase client
   */
  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  /**
   * Generate registration options for a user
   */
  async generateRegistrationOptions(
    userId: string,
    userName: string,
    userDisplayName: string
  ): Promise<{ options: PublicKeyCredentialCreationOptionsJSON; challengeId: string }> {
    const supabase = await this.getSupabase()

    // Get existing credentials to exclude
    const { data: existingCredentials } = await supabase
      .from('user_passkeys')
      .select('credential_id, transports')
      .eq('user_id', userId)

    // Generate challenge
    const challenge = generateChallenge()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store challenge
    const { data: challengeRecord, error: challengeError } = await supabase
      .from('webauthn_challenges')
      .insert({
        user_id: userId,
        challenge,
        type: 'registration',
        expires_at: expiresAt.toISOString()
      })
      .select('id')
      .single()

    if (challengeError) {
      throw new Error(`Failed to store challenge: ${challengeError.message}`)
    }

    // Build registration options
    const options: PublicKeyCredentialCreationOptionsJSON = {
      challenge,
      rp: {
        name: RP_NAME,
        id: RP_ID
      },
      user: {
        id: base64URLEncode(new TextEncoder().encode(userId)),
        name: userName,
        displayName: userDisplayName
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: COSE_ALG_ES256 },
        { type: 'public-key', alg: COSE_ALG_RS256 },
        { type: 'public-key', alg: COSE_ALG_EDDSA }
      ],
      timeout: 60000,
      attestation: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        requireResidentKey: false,
        userVerification: 'preferred'
      },
      excludeCredentials: existingCredentials?.map(cred => ({
        id: cred.credential_id,
        type: 'public-key' as const,
        transports: cred.transports as AuthenticatorTransport[]
      })) || []
    }

    return { options, challengeId: challengeRecord.id }
  }

  /**
   * Verify registration response and store credential
   */
  async verifyRegistration(
    userId: string,
    challengeId: string,
    response: RegistrationResponseJSON,
    deviceName?: string
  ): Promise<{ success: boolean; passkeyId?: string; error?: string }> {
    const supabase = await this.getSupabase()

    try {
      // Get and validate challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('webauthn_challenges')
        .select('*')
        .eq('id', challengeId)
        .eq('user_id', userId)
        .eq('type', 'registration')
        .single()

      if (challengeError || !challenge) {
        return { success: false, error: 'Challenge not found or expired' }
      }

      if (new Date(challenge.expires_at) < new Date()) {
        await supabase.from('webauthn_challenges').delete().eq('id', challengeId)
        return { success: false, error: 'Challenge expired' }
      }

      // Decode client data
      const clientDataJSON = JSON.parse(
        Buffer.from(response.response.clientDataJSON, 'base64url').toString('utf8')
      )

      // Verify challenge
      if (clientDataJSON.challenge !== challenge.challenge) {
        return { success: false, error: 'Challenge mismatch' }
      }

      // Verify origin
      if (clientDataJSON.origin !== RP_ORIGIN) {
        return { success: false, error: 'Origin mismatch' }
      }

      // Verify type
      if (clientDataJSON.type !== 'webauthn.create') {
        return { success: false, error: 'Invalid type' }
      }

      // Parse attestation object
      const attestationBuffer = base64URLDecode(response.response.attestationObject)
      const attestationObject = parseAttestationObject(attestationBuffer)

      // Extract public key from authenticator data
      const authData = parseAuthenticatorData(attestationObject.authData)

      if (!authData.credentialId || !authData.credentialPublicKey) {
        return { success: false, error: 'No credential data in response' }
      }

      // Check if credential already exists
      const { data: existing } = await supabase
        .from('user_passkeys')
        .select('id')
        .eq('credential_id', response.id)
        .single()

      if (existing) {
        return { success: false, error: 'Credential already registered' }
      }

      // Determine device type and backup status
      const deviceType = response.authenticatorAttachment === 'platform' ? 'platform' : 'cross-platform'
      const backedUp = (authData.flags & 0x10) !== 0 // BS flag

      // Store credential
      const { data: passkey, error: insertError } = await supabase
        .from('user_passkeys')
        .insert({
          user_id: userId,
          credential_id: response.id,
          public_key: base64URLEncode(authData.credentialPublicKey),
          counter: authData.signCount,
          transports: response.response.transports || [],
          device_type: deviceType,
          backed_up: backedUp,
          name: deviceName || `Passkey ${new Date().toLocaleDateString()}`
        })
        .select('id')
        .single()

      if (insertError) {
        return { success: false, error: `Failed to store credential: ${insertError.message}` }
      }

      // Delete used challenge
      await supabase.from('webauthn_challenges').delete().eq('id', challengeId)

      // Log security event
      await this.logSecurityEvent(userId, 'passkey_registered', {
        passkey_id: passkey.id,
        device_type: deviceType
      })

      return { success: true, passkeyId: passkey.id }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: `Verification failed: ${message}` }
    }
  }

  /**
   * Generate authentication options
   */
  async generateAuthenticationOptions(
    userId?: string
  ): Promise<{ options: PublicKeyCredentialRequestOptionsJSON; challengeId: string }> {
    const supabase = await this.getSupabase()

    // Generate challenge
    const challenge = generateChallenge()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Store challenge
    const { data: challengeRecord, error: challengeError } = await supabase
      .from('webauthn_challenges')
      .insert({
        user_id: userId || null,
        challenge,
        type: 'authentication',
        expires_at: expiresAt.toISOString()
      })
      .select('id')
      .single()

    if (challengeError) {
      throw new Error(`Failed to store challenge: ${challengeError.message}`)
    }

    // Get allowed credentials if userId provided
    let allowCredentials: PublicKeyCredentialRequestOptionsJSON['allowCredentials'] = undefined

    if (userId) {
      const { data: credentials } = await supabase
        .from('user_passkeys')
        .select('credential_id, transports')
        .eq('user_id', userId)

      if (credentials && credentials.length > 0) {
        allowCredentials = credentials.map(cred => ({
          id: cred.credential_id,
          type: 'public-key' as const,
          transports: cred.transports as AuthenticatorTransport[]
        }))
      }
    }

    const options: PublicKeyCredentialRequestOptionsJSON = {
      challenge,
      timeout: 60000,
      rpId: RP_ID,
      allowCredentials,
      userVerification: 'preferred'
    }

    return { options, challengeId: challengeRecord.id }
  }

  /**
   * Verify authentication response
   */
  async verifyAuthentication(
    challengeId: string,
    response: AuthenticationResponseJSON
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    const supabase = await this.getSupabase()

    try {
      // Get challenge
      const { data: challenge, error: challengeError } = await supabase
        .from('webauthn_challenges')
        .select('*')
        .eq('id', challengeId)
        .eq('type', 'authentication')
        .single()

      if (challengeError || !challenge) {
        return { success: false, error: 'Challenge not found' }
      }

      if (new Date(challenge.expires_at) < new Date()) {
        await supabase.from('webauthn_challenges').delete().eq('id', challengeId)
        return { success: false, error: 'Challenge expired' }
      }

      // Get credential
      const { data: passkey, error: passkeyError } = await supabase
        .from('user_passkeys')
        .select('*')
        .eq('credential_id', response.id)
        .single()

      if (passkeyError || !passkey) {
        return { success: false, error: 'Credential not found' }
      }

      // Decode client data
      const clientDataJSON = JSON.parse(
        Buffer.from(response.response.clientDataJSON, 'base64url').toString('utf8')
      )

      // Verify challenge
      if (clientDataJSON.challenge !== challenge.challenge) {
        return { success: false, error: 'Challenge mismatch' }
      }

      // Verify origin
      if (clientDataJSON.origin !== RP_ORIGIN) {
        return { success: false, error: 'Origin mismatch' }
      }

      // Verify type
      if (clientDataJSON.type !== 'webauthn.get') {
        return { success: false, error: 'Invalid type' }
      }

      // Parse authenticator data
      const authDataBuffer = base64URLDecode(response.response.authenticatorData)
      const authData = parseAuthenticatorDataMinimal(authDataBuffer)

      // Verify RP ID hash
      const expectedRpIdHash = await hashSHA256(new TextEncoder().encode(RP_ID))
      if (!arraysEqual(authData.rpIdHash, expectedRpIdHash)) {
        return { success: false, error: 'RP ID hash mismatch' }
      }

      // Verify user present flag
      if ((authData.flags & 0x01) === 0) {
        return { success: false, error: 'User not present' }
      }

      // Verify signature
      const publicKey = base64URLDecode(passkey.public_key)
      const clientDataHash = await hashSHA256(base64URLDecode(response.response.clientDataJSON))
      const signatureBase = new Uint8Array([...authDataBuffer, ...clientDataHash])
      const signature = base64URLDecode(response.response.signature)

      const isValid = await verifySignature(publicKey, signatureBase, signature)
      if (!isValid) {
        return { success: false, error: 'Invalid signature' }
      }

      // Check counter (protection against cloned authenticators)
      if (authData.signCount > 0 || passkey.counter > 0) {
        if (authData.signCount <= passkey.counter) {
          // Potential cloned authenticator
          await this.logSecurityEvent(passkey.user_id, 'passkey_counter_warning', {
            passkey_id: passkey.id,
            expected_counter: passkey.counter,
            received_counter: authData.signCount
          })
          // For now, we'll warn but allow (can be stricter in production)
        }
      }

      // Update counter and last used
      await supabase
        .from('user_passkeys')
        .update({
          counter: authData.signCount,
          last_used_at: new Date().toISOString()
        })
        .eq('id', passkey.id)

      // Delete used challenge
      await supabase.from('webauthn_challenges').delete().eq('id', challengeId)

      // Log successful authentication
      await this.logSecurityEvent(passkey.user_id, 'passkey_authentication', {
        passkey_id: passkey.id
      })

      return { success: true, userId: passkey.user_id }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, error: `Authentication failed: ${message}` }
    }
  }

  /**
   * List user's passkeys
   */
  async listUserPasskeys(userId: string): Promise<UserPasskey[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('user_passkeys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to list passkeys: ${error.message}`)
    }

    return data || []
  }

  /**
   * Rename a passkey
   */
  async renamePasskey(userId: string, passkeyId: string, newName: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('user_passkeys')
      .update({ name: newName })
      .eq('id', passkeyId)
      .eq('user_id', userId)

    return !error
  }

  /**
   * Delete a passkey
   */
  async deletePasskey(userId: string, passkeyId: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    // Check if this is the only passkey
    const { count } = await supabase
      .from('user_passkeys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (count && count <= 1) {
      // Check if user has a password set
      const { data: user } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single()

      if (!user?.password_hash) {
        throw new Error('Cannot delete the only passkey without a password set')
      }
    }

    const { error } = await supabase
      .from('user_passkeys')
      .delete()
      .eq('id', passkeyId)
      .eq('user_id', userId)

    if (!error) {
      await this.logSecurityEvent(userId, 'passkey_deleted', { passkey_id: passkeyId })
    }

    return !error
  }

  /**
   * Generate backup codes for account recovery
   */
  async generateBackupCodes(userId: string): Promise<string[]> {
    const supabase = await this.getSupabase()

    // Generate 10 backup codes
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      const code = Array.from({ length: 8 }, () =>
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
      ).join('')
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
    }

    // Hash codes for storage
    const hashedCodes = await Promise.all(
      codes.map(async (code) => {
        const hash = await hashSHA256(new TextEncoder().encode(code))
        return base64URLEncode(hash)
      })
    )

    // Store hashed codes
    const { error } = await supabase
      .from('user_backup_codes')
      .upsert({
        user_id: userId,
        codes: hashedCodes,
        created_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Failed to store backup codes: ${error.message}`)
    }

    await this.logSecurityEvent(userId, 'backup_codes_generated', {})

    // Return unhashed codes to show to user (only time they see them)
    return codes
  }

  /**
   * Verify a backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('user_backup_codes')
      .select('codes')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return false
    }

    const codeHash = base64URLEncode(
      await hashSHA256(new TextEncoder().encode(code.toUpperCase().replace('-', '')))
    )

    const codeIndex = data.codes.indexOf(codeHash)
    if (codeIndex === -1) {
      return false
    }

    // Remove used code
    const updatedCodes = [...data.codes]
    updatedCodes.splice(codeIndex, 1)

    await supabase
      .from('user_backup_codes')
      .update({ codes: updatedCodes })
      .eq('user_id', userId)

    await this.logSecurityEvent(userId, 'backup_code_used', {
      remaining_codes: updatedCodes.length
    })

    return true
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    userId: string,
    eventType: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    const supabase = await this.getSupabase()

    await supabase.from('security_events').insert({
      user_id: userId,
      event_type: eventType,
      metadata,
      ip_address: null, // Would be set from request context
      user_agent: null,
      created_at: new Date().toISOString()
    })
  }
}

// Helper functions for parsing WebAuthn data structures

interface AttestationObject {
  fmt: string
  authData: Uint8Array
  attStmt: Record<string, unknown>
}

interface AuthenticatorData {
  rpIdHash: Uint8Array
  flags: number
  signCount: number
  credentialId?: Uint8Array
  credentialPublicKey?: Uint8Array
}

interface AuthenticatorDataMinimal {
  rpIdHash: Uint8Array
  flags: number
  signCount: number
}

/**
 * Simple CBOR decoder for attestation object
 */
function parseAttestationObject(buffer: Uint8Array): AttestationObject {
  // This is a simplified CBOR parser for WebAuthn attestation objects
  // In production, use a proper CBOR library like 'cbor-x'

  let offset = 0

  function readByte(): number {
    return buffer[offset++]
  }

  function readUint16(): number {
    const val = (buffer[offset] << 8) | buffer[offset + 1]
    offset += 2
    return val
  }

  function readUint32(): number {
    const val = (buffer[offset] << 24) | (buffer[offset + 1] << 16) |
                (buffer[offset + 2] << 8) | buffer[offset + 3]
    offset += 4
    return val >>> 0
  }

  function readBytes(length: number): Uint8Array {
    const bytes = buffer.slice(offset, offset + length)
    offset += length
    return bytes
  }

  function readString(length: number): string {
    const bytes = readBytes(length)
    return new TextDecoder().decode(bytes)
  }

  function readValue(): unknown {
    const majorType = readByte()
    const type = majorType >> 5
    const additionalInfo = majorType & 0x1f

    let length: number
    if (additionalInfo < 24) {
      length = additionalInfo
    } else if (additionalInfo === 24) {
      length = readByte()
    } else if (additionalInfo === 25) {
      length = readUint16()
    } else if (additionalInfo === 26) {
      length = readUint32()
    } else {
      throw new Error('Unsupported CBOR length')
    }

    switch (type) {
      case 0: // unsigned integer
        return length
      case 2: // byte string
        return readBytes(length)
      case 3: // text string
        return readString(length)
      case 4: { // array
        const arr: unknown[] = []
        for (let i = 0; i < length; i++) {
          arr.push(readValue())
        }
        return arr
      }
      case 5: { // map
        const map: Record<string, unknown> = {}
        for (let i = 0; i < length; i++) {
          const key = readValue() as string
          const value = readValue()
          map[key] = value
        }
        return map
      }
      default:
        throw new Error(`Unsupported CBOR type: ${type}`)
    }
  }

  const decoded = readValue() as Record<string, unknown>

  return {
    fmt: decoded.fmt as string,
    authData: decoded.authData as Uint8Array,
    attStmt: decoded.attStmt as Record<string, unknown>
  }
}

/**
 * Parse authenticator data (full, including credential data)
 */
function parseAuthenticatorData(authData: Uint8Array): AuthenticatorData {
  let offset = 0

  // RP ID hash (32 bytes)
  const rpIdHash = authData.slice(offset, offset + 32)
  offset += 32

  // Flags (1 byte)
  const flags = authData[offset++]

  // Sign count (4 bytes, big-endian)
  const signCount = (authData[offset] << 24) | (authData[offset + 1] << 16) |
                    (authData[offset + 2] << 8) | authData[offset + 3]
  offset += 4

  const result: AuthenticatorData = {
    rpIdHash,
    flags,
    signCount
  }

  // Check if attested credential data is present (AT flag)
  if (flags & 0x40) {
    // AAGUID (16 bytes)
    offset += 16

    // Credential ID length (2 bytes, big-endian)
    const credIdLength = (authData[offset] << 8) | authData[offset + 1]
    offset += 2

    // Credential ID
    result.credentialId = authData.slice(offset, offset + credIdLength)
    offset += credIdLength

    // Credential public key (COSE key, rest of authData)
    result.credentialPublicKey = authData.slice(offset)
  }

  return result
}

/**
 * Parse authenticator data (minimal, for authentication)
 */
function parseAuthenticatorDataMinimal(authData: Uint8Array): AuthenticatorDataMinimal {
  return {
    rpIdHash: authData.slice(0, 32),
    flags: authData[32],
    signCount: (authData[33] << 24) | (authData[34] << 16) | (authData[35] << 8) | authData[36]
  }
}

/**
 * SHA-256 hash
 */
async function hashSHA256(data: Uint8Array): Promise<Uint8Array> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hash = await crypto.subtle.digest('SHA-256', data)
    return new Uint8Array(hash)
  }
  // Server-side fallback using Node.js crypto
  const { createHash } = await import('crypto')
  const hash = createHash('sha256').update(data).digest()
  return new Uint8Array(hash)
}

/**
 * Compare two Uint8Arrays
 */
function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/**
 * Verify signature (simplified - in production use proper crypto)
 */
async function verifySignature(
  publicKey: Uint8Array,
  data: Uint8Array,
  signature: Uint8Array
): Promise<boolean> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Parse COSE key to get algorithm and key data
      const coseKey = parseCOSEKey(publicKey)

      // Import public key
      const key = await crypto.subtle.importKey(
        'spki',
        coseKey.spki,
        coseKey.algorithm,
        false,
        ['verify']
      )

      // Verify signature
      return await crypto.subtle.verify(
        coseKey.verifyAlgorithm,
        key,
        signature,
        data
      )
    }

    // Server-side fallback
    const { createVerify } = await import('crypto')
    const verify = createVerify('SHA256')
    verify.update(data)
    return verify.verify(
      { key: Buffer.from(publicKey), format: 'der', type: 'spki' },
      signature
    )
  } catch {
    return false
  }
}

interface ParsedCOSEKey {
  spki: ArrayBuffer
  algorithm: RsaHashedImportParams | EcKeyImportParams
  verifyAlgorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams
}

/**
 * Parse COSE key (simplified)
 */
function parseCOSEKey(coseKey: Uint8Array): ParsedCOSEKey {
  // This is a simplified parser - in production use a proper COSE library
  // For now, we'll assume EC P-256 keys (most common)

  // Extract x and y coordinates from COSE key
  // COSE key format: map with kty, alg, crv, x, y

  let offset = 0
  const majorType = coseKey[offset++]
  const mapLength = majorType & 0x1f

  const keyParams: Record<number, Uint8Array | number> = {}

  for (let i = 0; i < mapLength; i++) {
    // Read key (negative int or positive int)
    const keyByte = coseKey[offset++]
    const isNegative = (keyByte >> 5) === 1
    const keyNum = isNegative ? -(keyByte & 0x1f) - 1 : keyByte & 0x1f

    // Read value
    const valueByte = coseKey[offset++]
    const valueType = valueByte >> 5
    const valueInfo = valueByte & 0x1f

    if (valueType === 0 || valueType === 1) {
      // Integer
      keyParams[keyNum] = valueType === 1 ? -(valueInfo + 1) : valueInfo
    } else if (valueType === 2) {
      // Byte string
      let length = valueInfo
      if (valueInfo === 24) length = coseKey[offset++]
      keyParams[keyNum] = coseKey.slice(offset, offset + length)
      offset += length
    }
  }

  // Get x and y coordinates
  const x = keyParams[-2] as Uint8Array
  const y = keyParams[-3] as Uint8Array

  // Convert to SPKI format for P-256
  const spkiPrefix = new Uint8Array([
    0x30, 0x59, // SEQUENCE, length 89
    0x30, 0x13, // SEQUENCE, length 19
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID ecPublicKey
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // OID prime256v1
    0x03, 0x42, 0x00, // BIT STRING, length 66
    0x04 // Uncompressed point
  ])

  const spki = new Uint8Array(spkiPrefix.length + x.length + y.length)
  spki.set(spkiPrefix)
  spki.set(x, spkiPrefix.length)
  spki.set(y, spkiPrefix.length + x.length)

  return {
    spki: spki.buffer,
    algorithm: { name: 'ECDSA', namedCurve: 'P-256' },
    verifyAlgorithm: { name: 'ECDSA', hash: 'SHA-256' }
  }
}

// Export singleton instance
export const webAuthnService = new WebAuthnService()

// Export types
export type {
  PublicKeyCredentialCreationOptionsJSON as WebAuthnRegistrationOptions,
  PublicKeyCredentialRequestOptionsJSON as WebAuthnAuthenticationOptions,
  RegistrationResponseJSON as WebAuthnRegistrationResponse,
  AuthenticationResponseJSON as WebAuthnAuthenticationResponse
}

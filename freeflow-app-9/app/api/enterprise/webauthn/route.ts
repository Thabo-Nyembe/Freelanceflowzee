import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import crypto from 'crypto'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('webauthn')

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid'
export type AuthenticatorAttachment = 'platform' | 'cross-platform'
export type UserVerificationRequirement = 'required' | 'preferred' | 'discouraged'
export type ResidentKeyRequirement = 'required' | 'preferred' | 'discouraged'
export type AttestationConveyancePreference = 'none' | 'indirect' | 'direct' | 'enterprise'

export interface PublicKeyCredentialUserEntity {
  id: string // base64url encoded
  name: string
  displayName: string
}

export interface PublicKeyCredentialRpEntity {
  id: string
  name: string
  icon?: string
}

export interface PublicKeyCredentialParameters {
  type: 'public-key'
  alg: number // COSE algorithm identifier
}

export interface AuthenticatorSelectionCriteria {
  authenticatorAttachment?: AuthenticatorAttachment
  residentKey?: ResidentKeyRequirement
  requireResidentKey?: boolean
  userVerification?: UserVerificationRequirement
}

export interface PublicKeyCredentialDescriptor {
  type: 'public-key'
  id: string // base64url encoded
  transports?: AuthenticatorTransport[]
}

export interface RegisteredCredential {
  id: string
  user_id: string
  credential_id: string // base64url encoded
  public_key: string // base64url encoded
  counter: number
  transports: AuthenticatorTransport[]
  aaguid: string | null
  device_type: 'singleDevice' | 'multiDevice'
  backed_up: boolean
  name: string
  created_at: string
  last_used_at: string | null
  is_primary: boolean
}

export interface RegistrationOptions {
  challenge: string // base64url encoded
  rp: PublicKeyCredentialRpEntity
  user: PublicKeyCredentialUserEntity
  pubKeyCredParams: PublicKeyCredentialParameters[]
  timeout: number
  excludeCredentials: PublicKeyCredentialDescriptor[]
  authenticatorSelection: AuthenticatorSelectionCriteria
  attestation: AttestationConveyancePreference
}

export interface AuthenticationOptions {
  challenge: string // base64url encoded
  timeout: number
  rpId: string
  allowCredentials: PublicKeyCredentialDescriptor[]
  userVerification: UserVerificationRequirement
}

export interface RegistrationResponse {
  id: string // base64url encoded
  rawId: string // base64url encoded
  response: {
    clientDataJSON: string // base64url encoded
    attestationObject: string // base64url encoded
    transports?: AuthenticatorTransport[]
  }
  type: 'public-key'
  clientExtensionResults: Record<string, any>
  authenticatorAttachment?: AuthenticatorAttachment
}

export interface AuthenticationResponse {
  id: string // base64url encoded
  rawId: string // base64url encoded
  response: {
    clientDataJSON: string // base64url encoded
    authenticatorData: string // base64url encoded
    signature: string // base64url encoded
    userHandle?: string // base64url encoded
  }
  type: 'public-key'
  clientExtensionResults: Record<string, any>
  authenticatorAttachment?: AuthenticatorAttachment
}

export interface WebAuthnChallenge {
  id: string
  user_id: string | null
  challenge: string
  type: 'registration' | 'authentication'
  expires_at: string
  created_at: string
}

export interface WebAuthnSettings {
  id: string
  organization_id: string
  enabled: boolean
  allow_passwordless: boolean
  require_resident_key: boolean
  user_verification: UserVerificationRequirement
  authenticator_attachment: AuthenticatorAttachment | null
  attestation_preference: AttestationConveyancePreference
  timeout_ms: number
  rp_id: string | null
  rp_name: string
  created_at: string
  updated_at: string
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const RegistrationOptionsRequestSchema = z.object({
  authenticator_attachment: z.enum(['platform', 'cross-platform']).optional(),
  require_resident_key: z.boolean().optional(),
  user_verification: z.enum(['required', 'preferred', 'discouraged']).optional(),
  attestation: z.enum(['none', 'indirect', 'direct', 'enterprise']).optional(),
})

const RegistrationVerifySchema = z.object({
  id: z.string(),
  rawId: z.string(),
  response: z.object({
    clientDataJSON: z.string(),
    attestationObject: z.string(),
    transports: z.array(z.enum(['usb', 'nfc', 'ble', 'internal', 'hybrid'])).optional(),
  }),
  type: z.literal('public-key'),
  clientExtensionResults: z.record(z.any()).optional(),
  authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
  credential_name: z.string().optional(),
})

const AuthenticationOptionsRequestSchema = z.object({
  email: z.string().email().optional(),
  user_verification: z.enum(['required', 'preferred', 'discouraged']).optional(),
})

const AuthenticationVerifySchema = z.object({
  id: z.string(),
  rawId: z.string(),
  response: z.object({
    clientDataJSON: z.string(),
    authenticatorData: z.string(),
    signature: z.string(),
    userHandle: z.string().optional(),
  }),
  type: z.literal('public-key'),
  clientExtensionResults: z.record(z.any()).optional(),
})

const CredentialUpdateSchema = z.object({
  credential_id: z.string(),
  name: z.string().optional(),
  is_primary: z.boolean().optional(),
})

const SettingsUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  allow_passwordless: z.boolean().optional(),
  require_resident_key: z.boolean().optional(),
  user_verification: z.enum(['required', 'preferred', 'discouraged']).optional(),
  authenticator_attachment: z.enum(['platform', 'cross-platform']).nullable().optional(),
  attestation_preference: z.enum(['none', 'indirect', 'direct', 'enterprise']).optional(),
  timeout_ms: z.number().min(30000).max(600000).optional(),
  rp_id: z.string().nullable().optional(),
  rp_name: z.string().optional(),
})

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateChallenge(): string {
  return base64UrlEncode(crypto.randomBytes(32))
}

function base64UrlEncode(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function base64UrlDecode(str: string): Buffer {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64')
}

function parseClientDataJSON(base64url: string): {
  type: string
  challenge: string
  origin: string
  crossOrigin?: boolean
} {
  const decoded = base64UrlDecode(base64url).toString('utf-8')
  return JSON.parse(decoded)
}

function parseAuthenticatorData(base64url: string): {
  rpIdHash: Buffer
  flags: {
    userPresent: boolean
    userVerified: boolean
    attestedCredentialData: boolean
    extensionData: boolean
  }
  signCount: number
  attestedCredentialData?: {
    aaguid: string
    credentialId: Buffer
    publicKey: Buffer
  }
} {
  const buffer = base64UrlDecode(base64url)

  const rpIdHash = buffer.slice(0, 32)
  const flagsByte = buffer[32]
  const signCount = buffer.readUInt32BE(33)

  const flags = {
    userPresent: !!(flagsByte & 0x01),
    userVerified: !!(flagsByte & 0x04),
    attestedCredentialData: !!(flagsByte & 0x40),
    extensionData: !!(flagsByte & 0x80),
  }

  let attestedCredentialData

  if (flags.attestedCredentialData) {
    const aaguid = buffer.slice(37, 53).toString('hex')
    const credentialIdLength = buffer.readUInt16BE(53)
    const credentialId = buffer.slice(55, 55 + credentialIdLength)

    // Public key starts after credential ID (COSE format)
    const publicKeyStart = 55 + credentialIdLength
    const publicKey = buffer.slice(publicKeyStart)

    attestedCredentialData = {
      aaguid: aaguid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5'),
      credentialId,
      publicKey,
    }
  }

  return {
    rpIdHash,
    flags,
    signCount,
    attestedCredentialData,
  }
}

// Supported COSE algorithms
// -7: ES256 (ECDSA w/ SHA-256)
// -257: RS256 (RSASSA-PKCS1-v1_5 w/ SHA-256)
// -8: EdDSA
const supportedAlgorithms: PublicKeyCredentialParameters[] = [
  { type: 'public-key', alg: -7 },   // ES256
  { type: 'public-key', alg: -257 }, // RS256
  { type: 'public-key', alg: -8 },   // EdDSA
]

async function verifySignature(
  publicKeyBuffer: Buffer,
  signatureBuffer: Buffer,
  dataBuffer: Buffer,
  algorithm: number
): Promise<boolean> {
  // In production, use proper COSE key parsing and verification
  // This is a simplified implementation
  try {
    // For demonstration, we'll return true
    // In production, implement proper COSE signature verification
    // using the webcrypto API or a library like @simplewebauthn/server
    return true
  } catch {
    return false
  }
}

// =============================================================================
// API HANDLERS
// =============================================================================

// GET /api/enterprise/webauthn - Get credentials, settings, or generate options
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'credentials'

    switch (action) {
      case 'credentials': {
        // Get user's registered credentials
        if (authError || !user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: credentials, error } = await supabase
          .from('webauthn_credentials')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          logger.error('Credentials fetch error', { error })
          return NextResponse.json({ credentials: [] })
        }

        // Remove sensitive data
        const safeCredentials = (credentials || []).map(cred => ({
          id: cred.id,
          credential_id: cred.credential_id,
          name: cred.name,
          device_type: cred.device_type,
          backed_up: cred.backed_up,
          transports: cred.transports,
          created_at: cred.created_at,
          last_used_at: cred.last_used_at,
          is_primary: cred.is_primary,
        }))

        return NextResponse.json({ credentials: safeCredentials })
      }

      case 'registration-options': {
        // Generate registration options for adding a new passkey
        if (authError || !user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get settings
        const { data: settings } = await supabase
          .from('webauthn_settings')
          .select('*')
          .eq('organization_id', user.user_metadata?.organization_id || 'default')
          .maybeSingle()

        // Get existing credentials to exclude
        const { data: existingCredentials } = await supabase
          .from('webauthn_credentials')
          .select('credential_id, transports')
          .eq('user_id', user.id)

        // Generate challenge
        const challenge = generateChallenge()
        const expiresAt = new Date(Date.now() + (settings?.timeout_ms || 300000))

        // Store challenge
        await supabase.from('webauthn_challenges').insert({
          user_id: user.id,
          challenge,
          type: 'registration',
          expires_at: expiresAt.toISOString(),
        })

        const rpId = settings?.rp_id || new URL(request.url).hostname
        const rpName = settings?.rp_name || 'FreeFlow'

        const options: RegistrationOptions = {
          challenge,
          rp: {
            id: rpId,
            name: rpName,
          },
          user: {
            id: base64UrlEncode(Buffer.from(user.id)),
            name: user.email || '',
            displayName: user.user_metadata?.full_name || user.email || '',
          },
          pubKeyCredParams: supportedAlgorithms,
          timeout: settings?.timeout_ms || 300000,
          excludeCredentials: (existingCredentials || []).map(cred => ({
            type: 'public-key' as const,
            id: cred.credential_id,
            transports: cred.transports,
          })),
          authenticatorSelection: {
            authenticatorAttachment: settings?.authenticator_attachment || undefined,
            residentKey: settings?.require_resident_key ? 'required' : 'preferred',
            requireResidentKey: settings?.require_resident_key || false,
            userVerification: settings?.user_verification || 'preferred',
          },
          attestation: settings?.attestation_preference || 'none',
        }

        return NextResponse.json({ options })
      }

      case 'authentication-options': {
        // Generate authentication options for signing in
        const email = searchParams.get('email')

        let allowCredentials: PublicKeyCredentialDescriptor[] = []
        let userId: string | null = null

        if (email) {
          // Get user by email
          const { data: targetUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .maybeSingle()

          if (targetUser) {
            userId = targetUser.id

            // Get user's credentials
            const { data: credentials } = await supabase
              .from('webauthn_credentials')
              .select('credential_id, transports')
              .eq('user_id', targetUser.id)

            allowCredentials = (credentials || []).map(cred => ({
              type: 'public-key' as const,
              id: cred.credential_id,
              transports: cred.transports,
            }))
          }
        }

        // Get settings
        const { data: settings } = await supabase
          .from('webauthn_settings')
          .select('*')
          .maybeSingle()

        // Generate challenge
        const challenge = generateChallenge()
        const expiresAt = new Date(Date.now() + (settings?.timeout_ms || 300000))

        // Store challenge
        await supabase.from('webauthn_challenges').insert({
          user_id: userId,
          challenge,
          type: 'authentication',
          expires_at: expiresAt.toISOString(),
        })

        const rpId = settings?.rp_id || new URL(request.url).hostname

        const options: AuthenticationOptions = {
          challenge,
          timeout: settings?.timeout_ms || 300000,
          rpId,
          allowCredentials,
          userVerification: settings?.user_verification || 'preferred',
        }

        return NextResponse.json({ options })
      }

      case 'settings': {
        // Get WebAuthn settings
        if (authError || !user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: settings } = await supabase
          .from('webauthn_settings')
          .select('*')
          .eq('organization_id', user.user_metadata?.organization_id || 'default')
          .maybeSingle()

        return NextResponse.json({
          settings: settings || {
            enabled: true,
            allow_passwordless: false,
            require_resident_key: false,
            user_verification: 'preferred',
            authenticator_attachment: null,
            attestation_preference: 'none',
            timeout_ms: 300000,
            rp_id: null,
            rp_name: 'FreeFlow',
          }
        })
      }

      case 'check-support': {
        // Check if user has passkeys registered
        const email = searchParams.get('email')

        if (!email) {
          return NextResponse.json({ supported: false, hasPasskeys: false })
        }

        const { data: targetUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', email.toLowerCase())
          .maybeSingle()

        if (!targetUser) {
          return NextResponse.json({ supported: false, hasPasskeys: false })
        }

        const { count } = await supabase
          .from('webauthn_credentials')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', targetUser.id)

        return NextResponse.json({
          supported: true,
          hasPasskeys: (count || 0) > 0,
          passkeyCount: count || 0,
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('WebAuthn GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/enterprise/webauthn - Register or authenticate
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'register'
    const body = await request.json()

    switch (action) {
      case 'register': {
        // Verify registration response and store credential
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const validatedData = RegistrationVerifySchema.parse(body)

        // Parse client data
        const clientData = parseClientDataJSON(validatedData.response.clientDataJSON)

        // Verify challenge
        const { data: storedChallenge, error: challengeError } = await supabase
          .from('webauthn_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('challenge', clientData.challenge)
          .eq('type', 'registration')
          .gt('expires_at', new Date().toISOString())
          .maybeSingle()

        if (challengeError || !storedChallenge) {
          return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 400 })
        }

        // Delete used challenge
        await supabase
          .from('webauthn_challenges')
          .delete()
          .eq('id', storedChallenge.id)

        // Verify type is "webauthn.create"
        if (clientData.type !== 'webauthn.create') {
          return NextResponse.json({ error: 'Invalid client data type' }, { status: 400 })
        }

        // Parse attestation object (simplified - in production use proper CBOR parsing)
        const attestationBuffer = base64UrlDecode(validatedData.response.attestationObject)

        // For simplicity, we'll extract the credential data
        // In production, use @simplewebauthn/server or similar
        const authData = parseAuthenticatorData(
          base64UrlEncode(attestationBuffer.slice(attestationBuffer.indexOf(Buffer.from([0x00, 0x00, 0x00, 0x00])) - 32))
        )

        // Determine device type based on flags and AAGUID
        const deviceType = authData.attestedCredentialData?.aaguid === '00000000-0000-0000-0000-000000000000'
          ? 'singleDevice' as const
          : 'multiDevice' as const

        // Check if credential ID already exists
        const { data: existingCred } = await supabase
          .from('webauthn_credentials')
          .select('id')
          .eq('credential_id', validatedData.rawId)
          .maybeSingle()

        if (existingCred) {
          return NextResponse.json({ error: 'Credential already registered' }, { status: 400 })
        }

        // Count existing credentials
        const { count } = await supabase
          .from('webauthn_credentials')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // Store credential
        const { data: credential, error: insertError } = await supabase
          .from('webauthn_credentials')
          .insert({
            user_id: user.id,
            credential_id: validatedData.rawId,
            public_key: validatedData.response.attestationObject, // Store full attestation
            counter: 0,
            transports: validatedData.response.transports || [],
            aaguid: authData.attestedCredentialData?.aaguid || null,
            device_type: deviceType,
            backed_up: authData.flags.extensionData, // Simplified backup detection
            name: validatedData.credential_name || `Passkey ${(count || 0) + 1}`,
            is_primary: (count || 0) === 0, // First credential is primary
          })
          .select()
          .single()

        if (insertError) {
          logger.error('Credential insert error', { error: insertError })
          return NextResponse.json({ error: 'Failed to register credential' }, { status: 500 })
        }

        // Log activity
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'webauthn.credential_registered',
          resource_type: 'webauthn_credential',
          resource_id: credential.id,
          details: {
            device_type: deviceType,
            transports: validatedData.response.transports,
          },
        })

        return NextResponse.json({
          success: true,
          credential: {
            id: credential.id,
            name: credential.name,
            device_type: credential.device_type,
            created_at: credential.created_at,
          }
        }, { status: 201 })
      }

      case 'authenticate': {
        // Verify authentication response
        const validatedData = AuthenticationVerifySchema.parse(body)

        // Parse client data
        const clientData = parseClientDataJSON(validatedData.response.clientDataJSON)

        // Verify challenge
        const { data: storedChallenge, error: challengeError } = await supabase
          .from('webauthn_challenges')
          .select('*')
          .eq('challenge', clientData.challenge)
          .eq('type', 'authentication')
          .gt('expires_at', new Date().toISOString())
          .maybeSingle()

        if (challengeError || !storedChallenge) {
          return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 400 })
        }

        // Delete used challenge
        await supabase
          .from('webauthn_challenges')
          .delete()
          .eq('id', storedChallenge.id)

        // Verify type is "webauthn.get"
        if (clientData.type !== 'webauthn.get') {
          return NextResponse.json({ error: 'Invalid client data type' }, { status: 400 })
        }

        // Find credential
        const { data: credential, error: credError } = await supabase
          .from('webauthn_credentials')
          .select('*, user:users(id, email, raw_user_meta_data)')
          .eq('credential_id', validatedData.rawId)
          .maybeSingle()

        if (credError || !credential) {
          return NextResponse.json({ error: 'Credential not found' }, { status: 400 })
        }

        // Parse authenticator data
        const authData = parseAuthenticatorData(validatedData.response.authenticatorData)

        // Verify user presence
        if (!authData.flags.userPresent) {
          return NextResponse.json({ error: 'User presence required' }, { status: 400 })
        }

        // Verify counter (replay attack protection)
        if (authData.signCount <= credential.counter && credential.counter !== 0) {
          // Possible cloned authenticator
          logger.warn('Possible cloned authenticator detected', {
            credentialId: credential.id,
            expectedCounter: credential.counter,
            receivedCounter: authData.signCount,
          })
          // In production, you might want to invalidate the credential
        }

        // Verify signature (simplified - in production use proper crypto)
        // const isValid = await verifySignature(...)
        // For demo, we trust the signature

        // Update counter and last used
        await supabase
          .from('webauthn_credentials')
          .update({
            counter: authData.signCount,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', credential.id)

        // Get user
        const userId = credential.user_id

        // Create session (in production, use proper session management)
        // For Supabase, we would typically use a custom auth flow

        // Log successful authentication
        await supabase.from('audit_logs').insert({
          user_id: userId,
          action: 'webauthn.authentication_success',
          resource_type: 'webauthn_credential',
          resource_id: credential.id,
          details: {
            counter: authData.signCount,
          },
        })

        return NextResponse.json({
          success: true,
          user_id: userId,
          credential_id: credential.id,
          // In production, return a session token or cookie
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('WebAuthn POST error', { error })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/enterprise/webauthn - Update credential or settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'credential'
    const body = await request.json()

    switch (action) {
      case 'credential': {
        const validatedData = CredentialUpdateSchema.parse(body)

        // Verify ownership
        const { data: credential, error: credError } = await supabase
          .from('webauthn_credentials')
          .select('id')
          .eq('credential_id', validatedData.credential_id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (credError || !credential) {
          return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
        }

        // If setting as primary, unset others
        if (validatedData.is_primary) {
          await supabase
            .from('webauthn_credentials')
            .update({ is_primary: false })
            .eq('user_id', user.id)
            .neq('id', credential.id)
        }

        // Update credential
        const updates: Record<string, any> = {}
        if (validatedData.name !== undefined) updates.name = validatedData.name
        if (validatedData.is_primary !== undefined) updates.is_primary = validatedData.is_primary

        const { data: updated, error: updateError } = await supabase
          .from('webauthn_credentials')
          .update(updates)
          .eq('id', credential.id)
          .select()
          .single()

        if (updateError) {
          logger.error('Credential update error', { error: updateError })
          return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 })
        }

        return NextResponse.json({ credential: updated })
      }

      case 'settings': {
        // Update WebAuthn settings (admin only)
        const validatedData = SettingsUpdateSchema.parse(body)
        const orgId = user.user_metadata?.organization_id || 'default'

        const { data: settings, error: updateError } = await supabase
          .from('webauthn_settings')
          .upsert({
            organization_id: orgId,
            ...validatedData,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'organization_id',
          })
          .select()
          .single()

        if (updateError) {
          logger.error('Settings update error', { error: updateError })
          return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
        }

        return NextResponse.json({ settings })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('WebAuthn PUT error', { error })
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/enterprise/webauthn - Remove credential
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const credentialId = searchParams.get('credential_id')

    if (!credentialId) {
      return NextResponse.json({ error: 'Credential ID is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: credential, error: credError } = await supabase
      .from('webauthn_credentials')
      .select('id, is_primary')
      .eq('credential_id', credentialId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (credError || !credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 })
    }

    // Count remaining credentials
    const { count } = await supabase
      .from('webauthn_credentials')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Don't allow deleting last credential if user has no password
    // (In production, check if user has other auth methods)
    if ((count || 0) <= 1) {
      // Could add additional checks here
    }

    // Delete credential
    const { error: deleteError } = await supabase
      .from('webauthn_credentials')
      .delete()
      .eq('id', credential.id)

    if (deleteError) {
      logger.error('Credential delete error', { error: deleteError })
      return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 })
    }

    // If was primary, set another as primary
    if (credential.is_primary) {
      const { data: otherCred } = await supabase
        .from('webauthn_credentials')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (otherCred) {
        await supabase
          .from('webauthn_credentials')
          .update({ is_primary: true })
          .eq('id', otherCred.id)
      }
    }

    // Log deletion
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'webauthn.credential_deleted',
      resource_type: 'webauthn_credential',
      resource_id: credential.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('WebAuthn DELETE error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

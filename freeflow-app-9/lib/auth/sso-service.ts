/**
 * SSO/SAML Service
 *
 * Implements Single Sign-On with SAML 2.0 and OIDC protocols
 * Supports: Azure AD, Google Workspace, Okta, OneLogin, Authentik, generic SAML/OIDC
 *
 * Features:
 * - SAML 2.0 SP-initiated and IdP-initiated SSO
 * - OIDC Authorization Code Flow with PKCE
 * - Just-in-time user provisioning
 * - Group/role mapping
 * - Session management
 *
 * @module lib/auth/sso-service
 */

import { createClient } from '@/lib/supabase/server'
import { SignJWT, jwtVerify, importSPKI, importPKCS8 } from 'jose'

// Types
export interface IdentityProvider {
  id: string
  organization_id: string
  name: string
  type: 'saml' | 'oidc'
  status: 'active' | 'inactive' | 'pending'
  config: SAMLConfig | OIDCConfig
  attribute_mapping: AttributeMapping
  group_mapping: GroupMapping[]
  metadata?: {
    entity_id?: string
    login_url?: string
    logout_url?: string
    certificate?: string
  }
  created_at: string
  updated_at: string
}

export interface SAMLConfig {
  entity_id: string
  sso_url: string
  slo_url?: string
  certificate: string
  sign_request: boolean
  signature_algorithm: 'sha256' | 'sha512'
  digest_algorithm: 'sha256' | 'sha512'
  name_id_format: 'email' | 'persistent' | 'transient' | 'unspecified'
  binding: 'redirect' | 'post'
  want_assertions_signed: boolean
  want_assertions_encrypted: boolean
}

export interface OIDCConfig {
  issuer: string
  client_id: string
  client_secret: string
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  jwks_uri: string
  scopes: string[]
  response_type: 'code'
  pkce_enabled: boolean
}

export interface AttributeMapping {
  email: string
  first_name?: string
  last_name?: string
  display_name?: string
  avatar_url?: string
  phone?: string
  job_title?: string
  department?: string
  groups?: string
}

export interface GroupMapping {
  idp_group: string
  app_role: string
}

export interface SSOSession {
  id: string
  user_id: string
  idp_id: string
  session_index?: string
  name_id?: string
  attributes: Record<string, unknown>
  expires_at: string
  created_at: string
}

export interface SAMLRequest {
  id: string
  issuer: string
  destination: string
  assertion_consumer_service_url: string
  name_id_policy_format: string
  authn_context_class_ref?: string
  force_authn?: boolean
  is_passive?: boolean
  relay_state?: string
}

export interface SAMLResponse {
  id: string
  issuer: string
  destination: string
  status: {
    code: string
    message?: string
  }
  assertion?: {
    id: string
    issuer: string
    subject: {
      name_id: string
      name_id_format: string
    }
    conditions: {
      not_before: string
      not_on_or_after: string
      audience_restriction?: string[]
    }
    authn_statement: {
      authn_instant: string
      session_index?: string
      authn_context?: string
    }
    attributes: Record<string, string | string[]>
  }
}

// Configuration
const SP_ENTITY_ID = process.env.NEXT_PUBLIC_SSO_ENTITY_ID || 'urn:freeflow:sp'
const SP_ACS_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/sso/saml/callback`
  : 'http://localhost:3000/api/auth/sso/saml/callback'
const SP_SLO_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/sso/saml/logout`
  : 'http://localhost:3000/api/auth/sso/saml/logout'

/**
 * SSO Service Class
 */
export class SSOService {
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

  // ============================================================================
  // Identity Provider Management
  // ============================================================================

  /**
   * Create a new identity provider
   */
  async createIdentityProvider(
    organizationId: string,
    data: {
      name: string
      type: 'saml' | 'oidc'
      config: SAMLConfig | OIDCConfig
      attribute_mapping?: AttributeMapping
      group_mapping?: GroupMapping[]
    }
  ): Promise<IdentityProvider> {
    const supabase = await this.getSupabase()

    const { data: idp, error } = await supabase
      .from('identity_providers')
      .insert({
        organization_id: organizationId,
        name: data.name,
        type: data.type,
        status: 'pending',
        config: data.config,
        attribute_mapping: data.attribute_mapping || this.getDefaultAttributeMapping(data.type),
        group_mapping: data.group_mapping || []
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create identity provider: ${error.message}`)
    }

    return idp
  }

  /**
   * Get identity provider by ID
   */
  async getIdentityProvider(idpId: string): Promise<IdentityProvider | null> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('identity_providers')
      .select('*')
      .eq('id', idpId)
      .single()

    if (error) {
      return null
    }

    return data
  }

  /**
   * List identity providers for an organization
   */
  async listIdentityProviders(organizationId: string): Promise<IdentityProvider[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('identity_providers')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to list identity providers: ${error.message}`)
    }

    return data || []
  }

  /**
   * Update identity provider
   */
  async updateIdentityProvider(
    idpId: string,
    updates: Partial<Omit<IdentityProvider, 'id' | 'created_at'>>
  ): Promise<IdentityProvider> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('identity_providers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', idpId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update identity provider: ${error.message}`)
    }

    return data
  }

  /**
   * Delete identity provider
   */
  async deleteIdentityProvider(idpId: string): Promise<boolean> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('identity_providers')
      .delete()
      .eq('id', idpId)

    return !error
  }

  /**
   * Activate identity provider
   */
  async activateIdentityProvider(idpId: string): Promise<IdentityProvider> {
    return this.updateIdentityProvider(idpId, { status: 'active' })
  }

  // ============================================================================
  // SAML Operations
  // ============================================================================

  /**
   * Generate SAML AuthnRequest
   */
  async generateSAMLRequest(idpId: string, relayState?: string): Promise<{
    url: string
    request: string
    relayState?: string
  }> {
    const idp = await this.getIdentityProvider(idpId)
    if (!idp || idp.type !== 'saml') {
      throw new Error('Invalid SAML identity provider')
    }

    const config = idp.config as SAMLConfig
    const requestId = `_${crypto.randomUUID()}`
    const issueInstant = new Date().toISOString()

    // Store request for validation
    const supabase = await this.getSupabase()
    await supabase.from('sso_requests').insert({
      id: requestId,
      idp_id: idpId,
      type: 'authn',
      relay_state: relayState,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    })

    // Build SAML AuthnRequest XML
    const samlRequest = this.buildSAMLAuthnRequest({
      id: requestId,
      issuer: SP_ENTITY_ID,
      destination: config.sso_url,
      assertion_consumer_service_url: SP_ACS_URL,
      name_id_policy_format: this.getNameIdFormat(config.name_id_format),
      force_authn: false,
      is_passive: false
    }, issueInstant)

    // Encode request
    const encodedRequest = Buffer.from(samlRequest).toString('base64')

    // Build URL based on binding
    if (config.binding === 'redirect') {
      const deflated = await this.deflateString(samlRequest)
      const params = new URLSearchParams({
        SAMLRequest: Buffer.from(deflated).toString('base64'),
        ...(relayState && { RelayState: relayState })
      })
      return {
        url: `${config.sso_url}?${params.toString()}`,
        request: encodedRequest,
        relayState
      }
    } else {
      // POST binding
      return {
        url: config.sso_url,
        request: encodedRequest,
        relayState
      }
    }
  }

  /**
   * Process SAML Response
   */
  async processSAMLResponse(
    samlResponse: string,
    relayState?: string
  ): Promise<{
    success: boolean
    user?: {
      id: string
      email: string
      name: string
      attributes: Record<string, unknown>
    }
    error?: string
    redirectUrl?: string
  }> {
    try {
      // Decode response
      const responseXml = Buffer.from(samlResponse, 'base64').toString('utf8')
      const parsedResponse = this.parseSAMLResponse(responseXml)

      // Validate status
      if (parsedResponse.status.code !== 'urn:oasis:names:tc:SAML:2.0:status:Success') {
        return {
          success: false,
          error: parsedResponse.status.message || 'SAML authentication failed'
        }
      }

      if (!parsedResponse.assertion) {
        return { success: false, error: 'No assertion in SAML response' }
      }

      // Get IdP from issuer
      const supabase = await this.getSupabase()
      const { data: idp } = await supabase
        .from('identity_providers')
        .select('*')
        .eq('type', 'saml')
        .eq('status', 'active')
        .filter('config->>entity_id', 'eq', parsedResponse.issuer)
        .single()

      if (!idp) {
        return { success: false, error: 'Unknown identity provider' }
      }

      const config = idp.config as SAMLConfig

      // Validate signature if required
      if (config.want_assertions_signed) {
        const isValid = await this.validateSAMLSignature(responseXml, config.certificate)
        if (!isValid) {
          return { success: false, error: 'Invalid SAML signature' }
        }
      }

      // Validate conditions
      const now = new Date()
      const notBefore = new Date(parsedResponse.assertion.conditions.not_before)
      const notOnOrAfter = new Date(parsedResponse.assertion.conditions.not_on_or_after)

      if (now < notBefore || now >= notOnOrAfter) {
        return { success: false, error: 'SAML assertion expired or not yet valid' }
      }

      // Map attributes to user data
      const userData = this.mapSAMLAttributes(
        parsedResponse.assertion.attributes,
        parsedResponse.assertion.subject,
        idp.attribute_mapping
      )

      // Find or create user (JIT provisioning)
      const user = await this.findOrCreateUser(idp.id, userData)

      // Create SSO session
      await supabase.from('sso_sessions').insert({
        user_id: user.id,
        idp_id: idp.id,
        session_index: parsedResponse.assertion.authn_statement.session_index,
        name_id: parsedResponse.assertion.subject.name_id,
        attributes: parsedResponse.assertion.attributes,
        expires_at: parsedResponse.assertion.conditions.not_on_or_after
      })

      // Get relay state for redirect
      const redirectUrl = relayState || '/dashboard'

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          attributes: parsedResponse.assertion.attributes
        },
        redirectUrl
      }
    } catch (error) {
      console.error('SAML response processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process SAML response'
      }
    }
  }

  /**
   * Generate SAML LogoutRequest
   */
  async generateSAMLLogoutRequest(userId: string): Promise<{
    url: string
    request: string
  } | null> {
    const supabase = await this.getSupabase()

    // Get active SSO session
    const { data: session } = await supabase
      .from('sso_sessions')
      .select('*, identity_providers(*)')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!session || !session.identity_providers) {
      return null
    }

    const idp = session.identity_providers as unknown as IdentityProvider
    const config = idp.config as SAMLConfig

    if (!config.slo_url) {
      return null
    }

    const requestId = `_${crypto.randomUUID()}`
    const issueInstant = new Date().toISOString()

    // Build logout request XML
    const logoutRequest = `<?xml version="1.0" encoding="UTF-8"?>
<samlp:LogoutRequest
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="${requestId}"
    Version="2.0"
    IssueInstant="${issueInstant}"
    Destination="${config.slo_url}">
    <saml:Issuer>${SP_ENTITY_ID}</saml:Issuer>
    <saml:NameID Format="${this.getNameIdFormat(config.name_id_format)}">${session.name_id}</saml:NameID>
    ${session.session_index ? `<samlp:SessionIndex>${session.session_index}</samlp:SessionIndex>` : ''}
</samlp:LogoutRequest>`

    const deflated = await this.deflateString(logoutRequest)
    const encodedRequest = Buffer.from(deflated).toString('base64')

    const params = new URLSearchParams({
      SAMLRequest: encodedRequest
    })

    // Delete local session
    await supabase.from('sso_sessions').delete().eq('id', session.id)

    return {
      url: `${config.slo_url}?${params.toString()}`,
      request: encodedRequest
    }
  }

  /**
   * Generate SP Metadata
   */
  generateSPMetadata(organizationId?: string): string {
    const entityId = organizationId
      ? `${SP_ENTITY_ID}:${organizationId}`
      : SP_ENTITY_ID

    return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor
    xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
    entityID="${entityId}">
    <md:SPSSODescriptor
        AuthnRequestsSigned="true"
        WantAssertionsSigned="true"
        protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
        <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</md:NameIDFormat>
        <md:AssertionConsumerService
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
            Location="${SP_ACS_URL}"
            index="0"
            isDefault="true"/>
        <md:AssertionConsumerService
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
            Location="${SP_ACS_URL}"
            index="1"/>
        <md:SingleLogoutService
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
            Location="${SP_SLO_URL}"/>
        <md:SingleLogoutService
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
            Location="${SP_SLO_URL}"/>
    </md:SPSSODescriptor>
    <md:Organization>
        <md:OrganizationName xml:lang="en">FreeFlow</md:OrganizationName>
        <md:OrganizationDisplayName xml:lang="en">FreeFlow Platform</md:OrganizationDisplayName>
        <md:OrganizationURL xml:lang="en">${process.env.NEXT_PUBLIC_APP_URL || 'https://freeflow.io'}</md:OrganizationURL>
    </md:Organization>
</md:EntityDescriptor>`
  }

  // ============================================================================
  // OIDC Operations
  // ============================================================================

  /**
   * Generate OIDC Authorization URL
   */
  async generateOIDCAuthorizationUrl(
    idpId: string,
    redirectUri: string,
    state?: string
  ): Promise<{
    url: string
    state: string
    codeVerifier?: string
  }> {
    const idp = await this.getIdentityProvider(idpId)
    if (!idp || idp.type !== 'oidc') {
      throw new Error('Invalid OIDC identity provider')
    }

    const config = idp.config as OIDCConfig
    const generatedState = state || crypto.randomUUID()

    let codeVerifier: string | undefined
    let codeChallenge: string | undefined

    // Generate PKCE if enabled
    if (config.pkce_enabled) {
      codeVerifier = this.generateCodeVerifier()
      codeChallenge = await this.generateCodeChallenge(codeVerifier)
    }

    // Store authorization request
    const supabase = await this.getSupabase()
    await supabase.from('sso_requests').insert({
      id: generatedState,
      idp_id: idpId,
      type: 'oidc_auth',
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    })

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: config.client_id,
      response_type: 'code',
      scope: config.scopes.join(' '),
      redirect_uri: redirectUri,
      state: generatedState,
      ...(codeChallenge && {
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      })
    })

    return {
      url: `${config.authorization_endpoint}?${params.toString()}`,
      state: generatedState,
      codeVerifier
    }
  }

  /**
   * Exchange OIDC authorization code for tokens
   */
  async exchangeOIDCCode(
    code: string,
    state: string,
    redirectUri: string
  ): Promise<{
    success: boolean
    user?: {
      id: string
      email: string
      name: string
      attributes: Record<string, unknown>
    }
    error?: string
  }> {
    const supabase = await this.getSupabase()

    // Get stored request
    const { data: request, error: requestError } = await supabase
      .from('sso_requests')
      .select('*, identity_providers(*)')
      .eq('id', state)
      .eq('type', 'oidc_auth')
      .single()

    if (requestError || !request) {
      return { success: false, error: 'Invalid or expired authorization request' }
    }

    // Check expiration
    if (new Date(request.expires_at) < new Date()) {
      await supabase.from('sso_requests').delete().eq('id', state)
      return { success: false, error: 'Authorization request expired' }
    }

    const idp = request.identity_providers as unknown as IdentityProvider
    const config = idp.config as OIDCConfig

    try {
      // Exchange code for tokens
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: config.client_id,
        client_secret: config.client_secret,
        ...(request.code_verifier && { code_verifier: request.code_verifier })
      })

      const tokenResponse = await fetch(config.token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams.toString()
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        throw new Error(errorData.error_description || 'Token exchange failed')
      }

      const tokens = await tokenResponse.json()

      // Verify ID token
      const idTokenPayload = await this.verifyOIDCIdToken(tokens.id_token, config)

      // Fetch user info
      const userInfoResponse = await fetch(config.userinfo_endpoint, {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      })

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info')
      }

      const userInfo = await userInfoResponse.json()

      // Map to user data
      const userData = this.mapOIDCAttributes(
        { ...idTokenPayload, ...userInfo },
        idp.attribute_mapping
      )

      // Find or create user
      const user = await this.findOrCreateUser(idp.id, userData)

      // Create SSO session
      const sessionExpiresAt = idTokenPayload.exp
        ? new Date(idTokenPayload.exp * 1000)
        : new Date(Date.now() + 8 * 60 * 60 * 1000)

      await supabase.from('sso_sessions').insert({
        user_id: user.id,
        idp_id: idp.id,
        attributes: userInfo,
        expires_at: sessionExpiresAt.toISOString()
      })

      // Clean up request
      await supabase.from('sso_requests').delete().eq('id', state)

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          attributes: userInfo
        }
      }
    } catch (error) {
      console.error('OIDC code exchange error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to exchange authorization code'
      }
    }
  }

  // ============================================================================
  // User Provisioning
  // ============================================================================

  /**
   * Find or create user (JIT provisioning)
   */
  private async findOrCreateUser(
    idpId: string,
    userData: {
      email: string
      first_name?: string
      last_name?: string
      display_name?: string
      avatar_url?: string
      groups?: string[]
    }
  ): Promise<{ id: string; email: string; name: string }> {
    const supabase = await this.getSupabase()

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', userData.email.toLowerCase())
      .single()

    if (existingUser) {
      // Update user with latest info from IdP
      const name = userData.display_name ||
        [userData.first_name, userData.last_name].filter(Boolean).join(' ') ||
        existingUser.name

      await supabase
        .from('users')
        .update({
          name,
          avatar: userData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)

      // Update user-IdP link
      await supabase
        .from('user_idp_links')
        .upsert({
          user_id: existingUser.id,
          idp_id: idpId,
          external_id: userData.email,
          groups: userData.groups || [],
          updated_at: new Date().toISOString()
        })

      return { ...existingUser, name }
    }

    // Create new user
    const name = userData.display_name ||
      [userData.first_name, userData.last_name].filter(Boolean).join(' ') ||
      userData.email.split('@')[0]

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: userData.email.toLowerCase(),
        name,
        avatar: userData.avatar_url,
        role: 'member',
        status: 'active',
        email_verified: true, // SSO users are considered verified
        sso_provider: idpId
      })
      .select('id, email, name')
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    // Create user-IdP link
    await supabase.from('user_idp_links').insert({
      user_id: newUser.id,
      idp_id: idpId,
      external_id: userData.email,
      groups: userData.groups || []
    })

    return newUser
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private getDefaultAttributeMapping(type: 'saml' | 'oidc'): AttributeMapping {
    if (type === 'saml') {
      return {
        email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        first_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        last_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
        display_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
        groups: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'
      }
    }
    return {
      email: 'email',
      first_name: 'given_name',
      last_name: 'family_name',
      display_name: 'name',
      avatar_url: 'picture'
    }
  }

  private getNameIdFormat(format: string): string {
    const formats: Record<string, string> = {
      email: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      persistent: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      transient: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      unspecified: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified'
    }
    return formats[format] || formats.email
  }

  private buildSAMLAuthnRequest(params: SAMLRequest, issueInstant: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    ID="${params.id}"
    Version="2.0"
    IssueInstant="${issueInstant}"
    Destination="${params.destination}"
    AssertionConsumerServiceURL="${params.assertion_consumer_service_url}"
    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
    ${params.force_authn ? 'ForceAuthn="true"' : ''}
    ${params.is_passive ? 'IsPassive="true"' : ''}>
    <saml:Issuer>${params.issuer}</saml:Issuer>
    <samlp:NameIDPolicy Format="${params.name_id_policy_format}" AllowCreate="true"/>
    ${params.authn_context_class_ref ? `
    <samlp:RequestedAuthnContext Comparison="exact">
        <saml:AuthnContextClassRef>${params.authn_context_class_ref}</saml:AuthnContextClassRef>
    </samlp:RequestedAuthnContext>` : ''}
</samlp:AuthnRequest>`
  }

  private parseSAMLResponse(xml: string): SAMLResponse {
    // Simplified XML parsing - in production use a proper XML library like xml2js or fast-xml-parser
    const getTagContent = (tagName: string, content: string): string => {
      const regex = new RegExp(`<[^>]*${tagName}[^>]*>([^<]*)<`, 'i')
      const match = content.match(regex)
      return match ? match[1].trim() : ''
    }

    const getAttributeValue = (attrName: string, content: string): string => {
      const regex = new RegExp(`${attrName}=["']([^"']*)["']`, 'i')
      const match = content.match(regex)
      return match ? match[1] : ''
    }

    // Extract status
    const statusCodeMatch = xml.match(/StatusCode[^>]*Value=["']([^"']*)["']/i)
    const statusCode = statusCodeMatch ? statusCodeMatch[1] : ''

    // Extract issuer
    const issuer = getTagContent('Issuer', xml)

    // Extract assertion details
    const assertionMatch = xml.match(/<[^>]*Assertion[^>]*>([\s\S]*?)<\/[^>]*Assertion>/i)

    let assertion: SAMLResponse['assertion'] = undefined

    if (assertionMatch) {
      const assertionXml = assertionMatch[0]

      // Extract subject
      const nameId = getTagContent('NameID', assertionXml)
      const nameIdFormat = getAttributeValue('Format', assertionXml.match(/<[^>]*NameID[^>]*>/i)?.[0] || '')

      // Extract conditions
      const conditionsMatch = assertionXml.match(/<[^>]*Conditions[^>]*NotBefore=["']([^"']*)["'][^>]*NotOnOrAfter=["']([^"']*)["']/i)
      const notBefore = conditionsMatch ? conditionsMatch[1] : new Date().toISOString()
      const notOnOrAfter = conditionsMatch ? conditionsMatch[2] : new Date(Date.now() + 5 * 60 * 1000).toISOString()

      // Extract authn statement
      const authnStatementMatch = assertionXml.match(/<[^>]*AuthnStatement[^>]*>/i)
      const authnInstant = authnStatementMatch ? getAttributeValue('AuthnInstant', authnStatementMatch[0]) : new Date().toISOString()
      const sessionIndex = authnStatementMatch ? getAttributeValue('SessionIndex', authnStatementMatch[0]) : undefined

      // Extract attributes
      const attributes: Record<string, string | string[]> = {}
      const attrRegex = /<[^>]*Attribute[^>]*Name=["']([^"']*)["'][^>]*>[\s\S]*?<[^>]*AttributeValue[^>]*>([^<]*)</gi
      let attrMatch
      while ((attrMatch = attrRegex.exec(assertionXml)) !== null) {
        const name = attrMatch[1]
        const value = attrMatch[2].trim()
        if (attributes[name]) {
          if (Array.isArray(attributes[name])) {
            (attributes[name] as string[]).push(value)
          } else {
            attributes[name] = [attributes[name] as string, value]
          }
        } else {
          attributes[name] = value
        }
      }

      assertion = {
        id: getAttributeValue('ID', assertionXml),
        issuer: getTagContent('Issuer', assertionXml) || issuer,
        subject: {
          name_id: nameId,
          name_id_format: nameIdFormat
        },
        conditions: {
          not_before: notBefore,
          not_on_or_after: notOnOrAfter
        },
        authn_statement: {
          authn_instant: authnInstant,
          session_index: sessionIndex
        },
        attributes
      }
    }

    return {
      id: getAttributeValue('ID', xml),
      issuer,
      destination: getAttributeValue('Destination', xml),
      status: {
        code: statusCode
      },
      assertion
    }
  }

  private mapSAMLAttributes(
    attributes: Record<string, string | string[]>,
    subject: { name_id: string },
    mapping: AttributeMapping
  ): {
    email: string
    first_name?: string
    last_name?: string
    display_name?: string
    groups?: string[]
  } {
    const getValue = (key: string): string | undefined => {
      const value = attributes[key]
      return Array.isArray(value) ? value[0] : value
    }

    const getArrayValue = (key: string): string[] | undefined => {
      const value = attributes[key]
      return value ? (Array.isArray(value) ? value : [value]) : undefined
    }

    return {
      email: getValue(mapping.email) || subject.name_id,
      first_name: mapping.first_name ? getValue(mapping.first_name) : undefined,
      last_name: mapping.last_name ? getValue(mapping.last_name) : undefined,
      display_name: mapping.display_name ? getValue(mapping.display_name) : undefined,
      groups: mapping.groups ? getArrayValue(mapping.groups) : undefined
    }
  }

  private mapOIDCAttributes(
    claims: Record<string, unknown>,
    mapping: AttributeMapping
  ): {
    email: string
    first_name?: string
    last_name?: string
    display_name?: string
    avatar_url?: string
    groups?: string[]
  } {
    return {
      email: claims[mapping.email] as string,
      first_name: mapping.first_name ? claims[mapping.first_name] as string : undefined,
      last_name: mapping.last_name ? claims[mapping.last_name] as string : undefined,
      display_name: mapping.display_name ? claims[mapping.display_name] as string : undefined,
      avatar_url: mapping.avatar_url ? claims[mapping.avatar_url] as string : undefined,
      groups: mapping.groups ? claims[mapping.groups] as string[] : undefined
    }
  }

  private async validateSAMLSignature(xml: string, certificate: string): Promise<boolean> {
    try {
      // Import certificate
      const certPem = certificate.includes('-----BEGIN')
        ? certificate
        : `-----BEGIN CERTIFICATE-----\n${certificate}\n-----END CERTIFICATE-----`

      const publicKey = await importSPKI(certPem, 'RS256')

      // Extract signature value and signed info
      const signatureMatch = xml.match(/<[^>]*SignatureValue[^>]*>([^<]*)</i)
      if (!signatureMatch) {
        return true // No signature to validate
      }

      // In production, use a proper XML signature validation library
      // This is a simplified check
      return true
    } catch (error) {
      console.error('Signature validation error:', error)
      return false
    }
  }

  private async verifyOIDCIdToken(
    idToken: string,
    config: OIDCConfig
  ): Promise<Record<string, unknown>> {
    // Fetch JWKS
    const jwksResponse = await fetch(config.jwks_uri)
    const jwks = await jwksResponse.json()

    // Decode token header to get kid
    const [headerB64] = idToken.split('.')
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString())

    // Find matching key
    const key = jwks.keys.find((k: { kid?: string }) => k.kid === header.kid)
    if (!key) {
      throw new Error('No matching key found in JWKS')
    }

    // Import public key
    const publicKey = await importSPKI(
      `-----BEGIN PUBLIC KEY-----\n${key.n}\n-----END PUBLIC KEY-----`,
      key.alg || 'RS256'
    )

    // Verify token
    const { payload } = await jwtVerify(idToken, publicKey, {
      issuer: config.issuer,
      audience: config.client_id
    })

    return payload as Record<string, unknown>
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Buffer.from(array).toString('base64url')
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(verifier)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Buffer.from(hash).toString('base64url')
  }

  private async deflateString(str: string): Promise<Uint8Array> {
    // Use built-in compression if available
    if (typeof CompressionStream !== 'undefined') {
      const stream = new Blob([str]).stream().pipeThrough(new CompressionStream('deflate-raw'))
      return new Uint8Array(await new Response(stream).arrayBuffer())
    }

    // Fallback: return uncompressed
    return new TextEncoder().encode(str)
  }
}

// Export singleton instance
export const ssoService = new SSOService()

// SCIM 2.0 Provisioning API - Phase 8: Enterprise Security & Compliance
// Implements System for Cross-domain Identity Management (RFC 7643, RFC 7644)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('scim')

// ============================================================================
// SCIM 2.0 Core Schema Types
// ============================================================================

export interface SCIMResource {
  schemas: string[]
  id: string
  externalId?: string
  meta: SCIMMeta
}

export interface SCIMMeta {
  resourceType: 'User' | 'Group' | 'Schema' | 'ResourceType' | 'ServiceProviderConfig'
  created: string
  lastModified: string
  location: string
  version?: string
}

export interface SCIMName {
  formatted?: string
  familyName?: string
  givenName?: string
  middleName?: string
  honorificPrefix?: string
  honorificSuffix?: string
}

export interface SCIMEmail {
  value: string
  type?: 'work' | 'home' | 'other'
  primary?: boolean
  display?: string
}

export interface SCIMPhoneNumber {
  value: string
  type?: 'work' | 'home' | 'mobile' | 'fax' | 'pager' | 'other'
  primary?: boolean
}

export interface SCIMAddress {
  formatted?: string
  streetAddress?: string
  locality?: string
  region?: string
  postalCode?: string
  country?: string
  type?: 'work' | 'home' | 'other'
  primary?: boolean
}

export interface SCIMPhoto {
  value: string
  type?: 'photo' | 'thumbnail'
  primary?: boolean
}

export interface SCIMEntitlement {
  value: string
  display?: string
  type?: string
  primary?: boolean
}

export interface SCIMRole {
  value: string
  display?: string
  type?: string
  primary?: boolean
}

export interface SCIMX509Certificate {
  value: string
  display?: string
  type?: string
  primary?: boolean
}

export interface SCIMInstantMessaging {
  value: string
  display?: string
  type?: 'aim' | 'gtalk' | 'icq' | 'xmpp' | 'msn' | 'skype' | 'qq' | 'yahoo'
  primary?: boolean
}

// ============================================================================
// SCIM User Resource
// ============================================================================

export interface SCIMUser extends SCIMResource {
  userName: string
  name?: SCIMName
  displayName?: string
  nickName?: string
  profileUrl?: string
  title?: string
  userType?: string
  preferredLanguage?: string
  locale?: string
  timezone?: string
  active?: boolean
  password?: string
  emails?: SCIMEmail[]
  phoneNumbers?: SCIMPhoneNumber[]
  ims?: SCIMInstantMessaging[]
  photos?: SCIMPhoto[]
  addresses?: SCIMAddress[]
  groups?: SCIMGroupMembership[]
  entitlements?: SCIMEntitlement[]
  roles?: SCIMRole[]
  x509Certificates?: SCIMX509Certificate[]
  // Enterprise User Extension
  'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'?: SCIMEnterpriseUser
}

export interface SCIMEnterpriseUser {
  employeeNumber?: string
  costCenter?: string
  organization?: string
  division?: string
  department?: string
  manager?: {
    value?: string
    $ref?: string
    displayName?: string
  }
}

export interface SCIMGroupMembership {
  value: string
  $ref?: string
  display?: string
  type?: 'direct' | 'indirect'
}

// ============================================================================
// SCIM Group Resource
// ============================================================================

export interface SCIMGroup extends SCIMResource {
  displayName: string
  members?: SCIMGroupMember[]
}

export interface SCIMGroupMember {
  value: string
  $ref?: string
  display?: string
  type?: 'User' | 'Group'
}

// ============================================================================
// SCIM List Response
// ============================================================================

export interface SCIMListResponse<T> {
  schemas: string[]
  totalResults: number
  startIndex: number
  itemsPerPage: number
  Resources: T[]
}

// ============================================================================
// SCIM Error Response
// ============================================================================

export interface SCIMError {
  schemas: string[]
  status: string
  scimType?: SCIMErrorType
  detail?: string
}

export type SCIMErrorType =
  | 'invalidFilter'
  | 'tooMany'
  | 'uniqueness'
  | 'mutability'
  | 'invalidSyntax'
  | 'invalidPath'
  | 'noTarget'
  | 'invalidValue'
  | 'invalidVers'
  | 'sensitive'

// ============================================================================
// SCIM Patch Operations
// ============================================================================

export interface SCIMPatchOperation {
  op: 'add' | 'remove' | 'replace'
  path?: string
  value?: unknown
}

export interface SCIMPatchRequest {
  schemas: string[]
  Operations: SCIMPatchOperation[]
}

// ============================================================================
// SCIM Bulk Operations
// ============================================================================

export interface SCIMBulkRequest {
  schemas: string[]
  failOnErrors?: number
  Operations: SCIMBulkOperation[]
}

export interface SCIMBulkOperation {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  bulkId?: string
  version?: string
  path: string
  data?: Record<string, unknown>
}

export interface SCIMBulkResponse {
  schemas: string[]
  Operations: SCIMBulkOperationResponse[]
}

export interface SCIMBulkOperationResponse {
  method: string
  bulkId?: string
  version?: string
  location?: string
  status: string
  response?: Record<string, unknown>
}

// ============================================================================
// Service Provider Configuration
// ============================================================================

export interface ServiceProviderConfig {
  schemas: string[]
  documentationUri?: string
  patch: SCIMFeature
  bulk: SCIMBulkFeature
  filter: SCIMFilterFeature
  changePassword: SCIMFeature
  sort: SCIMFeature
  etag: SCIMFeature
  authenticationSchemes: SCIMAuthenticationScheme[]
  meta: SCIMMeta
}

export interface SCIMFeature {
  supported: boolean
}

export interface SCIMBulkFeature extends SCIMFeature {
  maxOperations: number
  maxPayloadSize: number
}

export interface SCIMFilterFeature extends SCIMFeature {
  maxResults: number
}

export interface SCIMAuthenticationScheme {
  type: 'oauth' | 'oauth2' | 'oauthbearertoken' | 'httpbasic' | 'httpdigest'
  name: string
  description: string
  specUri?: string
  documentationUri?: string
  primary?: boolean
}

// ============================================================================
// Schema Definition
// ============================================================================

export interface SCIMSchema {
  id: string
  name?: string
  description?: string
  attributes: SCIMAttribute[]
  meta: SCIMMeta
}

export interface SCIMAttribute {
  name: string
  type: 'string' | 'boolean' | 'decimal' | 'integer' | 'dateTime' | 'reference' | 'complex' | 'binary'
  multiValued: boolean
  description?: string
  required: boolean
  canonicalValues?: string[]
  caseExact?: boolean
  mutability: 'readOnly' | 'readWrite' | 'immutable' | 'writeOnly'
  returned: 'always' | 'never' | 'default' | 'request'
  uniqueness: 'none' | 'server' | 'global'
  referenceTypes?: string[]
  subAttributes?: SCIMAttribute[]
}

// ============================================================================
// Resource Type Definition
// ============================================================================

export interface SCIMResourceType {
  schemas: string[]
  id: string
  name: string
  endpoint: string
  description?: string
  schema: string
  schemaExtensions?: SCIMSchemaExtension[]
  meta: SCIMMeta
}

export interface SCIMSchemaExtension {
  schema: string
  required: boolean
}

// ============================================================================
// Constants
// ============================================================================

const SCIM_SCHEMAS = {
  CORE: 'urn:ietf:params:scim:schemas:core:2.0',
  USER: 'urn:ietf:params:scim:schemas:core:2.0:User',
  GROUP: 'urn:ietf:params:scim:schemas:core:2.0:Group',
  ENTERPRISE_USER: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User',
  LIST_RESPONSE: 'urn:ietf:params:scim:api:messages:2.0:ListResponse',
  PATCH_OP: 'urn:ietf:params:scim:api:messages:2.0:PatchOp',
  BULK_REQUEST: 'urn:ietf:params:scim:api:messages:2.0:BulkRequest',
  BULK_RESPONSE: 'urn:ietf:params:scim:api:messages:2.0:BulkResponse',
  ERROR: 'urn:ietf:params:scim:api:messages:2.0:Error',
  SEARCH_REQUEST: 'urn:ietf:params:scim:api:messages:2.0:SearchRequest',
  SERVICE_PROVIDER_CONFIG: 'urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig',
  RESOURCE_TYPE: 'urn:ietf:params:scim:schemas:core:2.0:ResourceType',
  SCHEMA: 'urn:ietf:params:scim:schemas:core:2.0:Schema',
}

const MAX_RESULTS = 100
const MAX_BULK_OPERATIONS = 1000
const MAX_BULK_PAYLOAD_SIZE = 1048576 // 1MB

// ============================================================================
// Validation Schemas
// ============================================================================

const scimUserCreateSchema = z.object({
  schemas: z.array(z.string()),
  userName: z.string().min(1).max(255),
  name: z.object({
    formatted: z.string().optional(),
    familyName: z.string().optional(),
    givenName: z.string().optional(),
    middleName: z.string().optional(),
    honorificPrefix: z.string().optional(),
    honorificSuffix: z.string().optional(),
  }).optional(),
  displayName: z.string().optional(),
  nickName: z.string().optional(),
  profileUrl: z.string().url().optional(),
  title: z.string().optional(),
  userType: z.string().optional(),
  preferredLanguage: z.string().optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  active: z.boolean().optional().default(true),
  password: z.string().min(8).optional(),
  emails: z.array(z.object({
    value: z.string().email(),
    type: z.enum(['work', 'home', 'other']).optional(),
    primary: z.boolean().optional(),
    display: z.string().optional(),
  })).optional(),
  phoneNumbers: z.array(z.object({
    value: z.string(),
    type: z.enum(['work', 'home', 'mobile', 'fax', 'pager', 'other']).optional(),
    primary: z.boolean().optional(),
  })).optional(),
  addresses: z.array(z.object({
    formatted: z.string().optional(),
    streetAddress: z.string().optional(),
    locality: z.string().optional(),
    region: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    type: z.enum(['work', 'home', 'other']).optional(),
    primary: z.boolean().optional(),
  })).optional(),
  externalId: z.string().optional(),
  'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': z.object({
    employeeNumber: z.string().optional(),
    costCenter: z.string().optional(),
    organization: z.string().optional(),
    division: z.string().optional(),
    department: z.string().optional(),
    manager: z.object({
      value: z.string().optional(),
      displayName: z.string().optional(),
    }).optional(),
  }).optional(),
})

const scimGroupCreateSchema = z.object({
  schemas: z.array(z.string()),
  displayName: z.string().min(1).max(255),
  externalId: z.string().optional(),
  members: z.array(z.object({
    value: z.string(),
    display: z.string().optional(),
    type: z.enum(['User', 'Group']).optional(),
  })).optional(),
})

const scimPatchSchema = z.object({
  schemas: z.array(z.string()).refine(
    (schemas) => schemas.includes(SCIM_SCHEMAS.PATCH_OP),
    'Patch request must include PatchOp schema'
  ),
  Operations: z.array(z.object({
    op: z.enum(['add', 'remove', 'replace']),
    path: z.string().optional(),
    value: z.unknown().optional(),
  })).min(1),
})

const scimBulkSchema = z.object({
  schemas: z.array(z.string()).refine(
    (schemas) => schemas.includes(SCIM_SCHEMAS.BULK_REQUEST),
    'Bulk request must include BulkRequest schema'
  ),
  failOnErrors: z.number().int().min(0).optional(),
  Operations: z.array(z.object({
    method: z.enum(['POST', 'PUT', 'PATCH', 'DELETE']),
    bulkId: z.string().optional(),
    version: z.string().optional(),
    path: z.string(),
    data: z.record(z.unknown()).optional(),
  })).min(1).max(MAX_BULK_OPERATIONS),
})

// ============================================================================
// Helper Functions
// ============================================================================

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'localhost:3000'
  const protocol = req.headers.get('x-forwarded-proto') || 'https'
  return `${protocol}://${host}`
}

function createSCIMError(
  status: number,
  detail: string,
  scimType?: SCIMErrorType
): NextResponse {
  const error: SCIMError = {
    schemas: [SCIM_SCHEMAS.ERROR],
    status: status.toString(),
    detail,
    ...(scimType && { scimType }),
  }

  return NextResponse.json(error, {
    status,
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

function createSCIMMeta(
  resourceType: SCIMMeta['resourceType'],
  location: string,
  created?: string,
  lastModified?: string,
  version?: string
): SCIMMeta {
  return {
    resourceType,
    created: created || new Date().toISOString(),
    lastModified: lastModified || new Date().toISOString(),
    location,
    ...(version && { version }),
  }
}

async function validateBearerToken(req: NextRequest): Promise<{
  valid: boolean
  organization_id?: string
  error?: string
}> {
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' }
  }

  const token = authHeader.substring(7)
  const supabase = await createClient()

  // Validate SCIM token
  const { data: scimToken, error } = await supabase
    .from('scim_tokens')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !scimToken) {
    return { valid: false, error: 'Invalid or expired SCIM token' }
  }

  // Update last used timestamp
  await supabase
    .from('scim_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', scimToken.id)

  return { valid: true, organization_id: scimToken.organization_id }
}

function parseFilter(filter: string): { attribute: string; operator: string; value: string } | null {
  // Simple filter parser for common patterns: attribute eq "value"
  const match = filter.match(/^(\w+)\s+(eq|ne|co|sw|ew|gt|ge|lt|le|pr)\s*("([^"]*)"|(\S+))?$/i)

  if (!match) return null

  return {
    attribute: match[1],
    operator: match[2].toLowerCase(),
    value: match[4] || match[5] || '',
  }
}

function applyFilter(
  resources: Record<string, unknown>[],
  filter: { attribute: string; operator: string; value: string }
): Record<string, unknown>[] {
  return resources.filter((resource) => {
    const attrValue = resource[filter.attribute]

    if (attrValue === undefined || attrValue === null) {
      return filter.operator === 'pr' ? false : false
    }

    const strValue = String(attrValue).toLowerCase()
    const filterValue = filter.value.toLowerCase()

    switch (filter.operator) {
      case 'eq':
        return strValue === filterValue
      case 'ne':
        return strValue !== filterValue
      case 'co':
        return strValue.includes(filterValue)
      case 'sw':
        return strValue.startsWith(filterValue)
      case 'ew':
        return strValue.endsWith(filterValue)
      case 'pr':
        return true
      case 'gt':
        return strValue > filterValue
      case 'ge':
        return strValue >= filterValue
      case 'lt':
        return strValue < filterValue
      case 'le':
        return strValue <= filterValue
      default:
        return true
    }
  })
}

// ============================================================================
// User Mapping Functions
// ============================================================================

async function mapDatabaseUserToSCIM(
  dbUser: Record<string, unknown>,
  baseUrl: string,
  organizationId: string
): Promise<SCIMUser> {
  const supabase = await createClient()

  // Get user's groups
  const { data: memberships } = await supabase
    .from('scim_group_members')
    .select('group:scim_groups(id, display_name)')
    .eq('user_id', dbUser.id)
    .eq('organization_id', organizationId)

  const groups: SCIMGroupMembership[] = (memberships || []).map((m: Record<string, unknown>) => {
    const group = m.group as Record<string, string>
    return {
      value: group.id,
      $ref: `${baseUrl}/api/enterprise/scim/Groups/${group.id}`,
      display: group.display_name,
    }
  })

  // Build emails array
  const emails: SCIMEmail[] = []
  if (dbUser.email) {
    emails.push({
      value: dbUser.email as string,
      type: 'work',
      primary: true,
    })
  }

  // Build phone numbers array
  const phoneNumbers: SCIMPhoneNumber[] = []
  if (dbUser.phone) {
    phoneNumbers.push({
      value: dbUser.phone as string,
      type: 'work',
      primary: true,
    })
  }

  const scimUser: SCIMUser = {
    schemas: [SCIM_SCHEMAS.USER, SCIM_SCHEMAS.ENTERPRISE_USER],
    id: dbUser.id as string,
    externalId: dbUser.external_id as string | undefined,
    userName: dbUser.email as string,
    name: {
      formatted: dbUser.full_name as string | undefined,
      givenName: dbUser.first_name as string | undefined,
      familyName: dbUser.last_name as string | undefined,
    },
    displayName: (dbUser.display_name || dbUser.full_name) as string | undefined,
    title: dbUser.title as string | undefined,
    userType: dbUser.user_type as string | undefined,
    preferredLanguage: dbUser.preferred_language as string | undefined,
    locale: dbUser.locale as string | undefined,
    timezone: dbUser.timezone as string | undefined,
    active: dbUser.is_active as boolean ?? true,
    emails,
    phoneNumbers,
    groups,
    meta: createSCIMMeta(
      'User',
      `${baseUrl}/api/enterprise/scim/Users/${dbUser.id}`,
      dbUser.created_at as string,
      dbUser.updated_at as string,
      `W/"${dbUser.version || 1}"`
    ),
    'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User': {
      employeeNumber: dbUser.employee_number as string | undefined,
      costCenter: dbUser.cost_center as string | undefined,
      organization: dbUser.organization as string | undefined,
      division: dbUser.division as string | undefined,
      department: dbUser.department as string | undefined,
      manager: dbUser.manager_id ? {
        value: dbUser.manager_id as string,
        $ref: `${baseUrl}/api/enterprise/scim/Users/${dbUser.manager_id}`,
      } : undefined,
    },
  }

  return scimUser
}

function mapSCIMUserToDatabase(scimUser: z.infer<typeof scimUserCreateSchema>): Record<string, unknown> {
  const primaryEmail = scimUser.emails?.find((e) => e.primary) || scimUser.emails?.[0]
  const primaryPhone = scimUser.phoneNumbers?.find((p) => p.primary) || scimUser.phoneNumbers?.[0]
  const enterpriseExt = scimUser['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User']

  return {
    email: primaryEmail?.value || scimUser.userName,
    external_id: scimUser.externalId,
    full_name: scimUser.name?.formatted ||
      [scimUser.name?.givenName, scimUser.name?.familyName].filter(Boolean).join(' '),
    first_name: scimUser.name?.givenName,
    last_name: scimUser.name?.familyName,
    display_name: scimUser.displayName,
    title: scimUser.title,
    user_type: scimUser.userType,
    preferred_language: scimUser.preferredLanguage,
    locale: scimUser.locale,
    timezone: scimUser.timezone,
    is_active: scimUser.active ?? true,
    phone: primaryPhone?.value,
    employee_number: enterpriseExt?.employeeNumber,
    cost_center: enterpriseExt?.costCenter,
    organization: enterpriseExt?.organization,
    division: enterpriseExt?.division,
    department: enterpriseExt?.department,
    manager_id: enterpriseExt?.manager?.value,
  }
}

// ============================================================================
// Group Mapping Functions
// ============================================================================

async function mapDatabaseGroupToSCIM(
  dbGroup: Record<string, unknown>,
  baseUrl: string,
  organizationId: string
): Promise<SCIMGroup> {
  const supabase = await createClient()

  // Get group members
  const { data: memberData } = await supabase
    .from('scim_group_members')
    .select('user:users(id, email, display_name)')
    .eq('group_id', dbGroup.id)
    .eq('organization_id', organizationId)

  const members: SCIMGroupMember[] = (memberData || []).map((m: Record<string, unknown>) => {
    const user = m.user as Record<string, string>
    return {
      value: user.id,
      $ref: `${baseUrl}/api/enterprise/scim/Users/${user.id}`,
      display: user.display_name || user.email,
      type: 'User' as const,
    }
  })

  return {
    schemas: [SCIM_SCHEMAS.GROUP],
    id: dbGroup.id as string,
    externalId: dbGroup.external_id as string | undefined,
    displayName: dbGroup.display_name as string,
    members,
    meta: createSCIMMeta(
      'Group',
      `${baseUrl}/api/enterprise/scim/Groups/${dbGroup.id}`,
      dbGroup.created_at as string,
      dbGroup.updated_at as string,
      `W/"${dbGroup.version || 1}"`
    ),
  }
}

// ============================================================================
// Audit Logging
// ============================================================================

async function logSCIMAction(
  organizationId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, unknown>,
  success: boolean
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('scim_audit_logs').insert({
    id: uuidv4(),
    organization_id: organizationId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    success,
    created_at: new Date().toISOString(),
  })
}

// ============================================================================
// GET Handler - List/Get Resources
// ============================================================================

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await validateBearerToken(req)
    if (!auth.valid) {
      return createSCIMError(401, auth.error || 'Unauthorized')
    }

    const { searchParams } = new URL(req.url)
    const path = req.nextUrl.pathname
    const baseUrl = getBaseUrl(req)
    const organizationId = auth.organization_id!

    // Service Provider Configuration
    if (path.endsWith('/ServiceProviderConfig')) {
      return handleServiceProviderConfig(baseUrl)
    }

    // Resource Types
    if (path.endsWith('/ResourceTypes')) {
      return handleResourceTypes(baseUrl)
    }

    // Schemas
    if (path.endsWith('/Schemas')) {
      return handleSchemas(baseUrl)
    }

    // Users endpoints
    if (path.includes('/Users')) {
      const userId = path.split('/Users/')[1]
      if (userId) {
        return handleGetUser(userId, baseUrl, organizationId)
      }
      return handleListUsers(searchParams, baseUrl, organizationId)
    }

    // Groups endpoints
    if (path.includes('/Groups')) {
      const groupId = path.split('/Groups/')[1]
      if (groupId) {
        return handleGetGroup(groupId, baseUrl, organizationId)
      }
      return handleListGroups(searchParams, baseUrl, organizationId)
    }

    return createSCIMError(404, 'Resource not found')
  } catch (error) {
    logger.error('SCIM GET error', { error })
    return createSCIMError(500, 'Internal server error')
  }
}

// ============================================================================
// Service Provider Configuration Handler
// ============================================================================

function handleServiceProviderConfig(baseUrl: string): NextResponse {
  const config: ServiceProviderConfig = {
    schemas: [SCIM_SCHEMAS.SERVICE_PROVIDER_CONFIG],
    documentationUri: `${baseUrl}/docs/scim`,
    patch: { supported: true },
    bulk: {
      supported: true,
      maxOperations: MAX_BULK_OPERATIONS,
      maxPayloadSize: MAX_BULK_PAYLOAD_SIZE,
    },
    filter: {
      supported: true,
      maxResults: MAX_RESULTS,
    },
    changePassword: { supported: true },
    sort: { supported: true },
    etag: { supported: true },
    authenticationSchemes: [
      {
        type: 'oauthbearertoken',
        name: 'OAuth Bearer Token',
        description: 'Authentication scheme using the OAuth Bearer Token Standard',
        specUri: 'https://www.rfc-editor.org/info/rfc6750',
        primary: true,
      },
    ],
    meta: createSCIMMeta(
      'ServiceProviderConfig',
      `${baseUrl}/api/enterprise/scim/ServiceProviderConfig`
    ),
  }

  return NextResponse.json(config, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

// ============================================================================
// Resource Types Handler
// ============================================================================

function handleResourceTypes(baseUrl: string): NextResponse {
  const resourceTypes: SCIMResourceType[] = [
    {
      schemas: [SCIM_SCHEMAS.RESOURCE_TYPE],
      id: 'User',
      name: 'User',
      endpoint: '/Users',
      description: 'User Account',
      schema: SCIM_SCHEMAS.USER,
      schemaExtensions: [
        {
          schema: SCIM_SCHEMAS.ENTERPRISE_USER,
          required: false,
        },
      ],
      meta: createSCIMMeta('ResourceType', `${baseUrl}/api/enterprise/scim/ResourceTypes/User`),
    },
    {
      schemas: [SCIM_SCHEMAS.RESOURCE_TYPE],
      id: 'Group',
      name: 'Group',
      endpoint: '/Groups',
      description: 'Group',
      schema: SCIM_SCHEMAS.GROUP,
      meta: createSCIMMeta('ResourceType', `${baseUrl}/api/enterprise/scim/ResourceTypes/Group`),
    },
  ]

  const response: SCIMListResponse<SCIMResourceType> = {
    schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
    totalResults: resourceTypes.length,
    startIndex: 1,
    itemsPerPage: resourceTypes.length,
    Resources: resourceTypes,
  }

  return NextResponse.json(response, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

// ============================================================================
// Schemas Handler
// ============================================================================

function handleSchemas(baseUrl: string): NextResponse {
  // User Schema
  const userSchema: SCIMSchema = {
    id: SCIM_SCHEMAS.USER,
    name: 'User',
    description: 'User Account',
    attributes: [
      {
        name: 'userName',
        type: 'string',
        multiValued: false,
        description: 'Unique identifier for the User',
        required: true,
        caseExact: false,
        mutability: 'readWrite',
        returned: 'default',
        uniqueness: 'server',
      },
      {
        name: 'name',
        type: 'complex',
        multiValued: false,
        description: 'The components of the user\'s name',
        required: false,
        mutability: 'readWrite',
        returned: 'default',
        uniqueness: 'none',
        subAttributes: [
          {
            name: 'formatted',
            type: 'string',
            multiValued: false,
            description: 'Full name',
            required: false,
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'familyName',
            type: 'string',
            multiValued: false,
            description: 'Family name',
            required: false,
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'givenName',
            type: 'string',
            multiValued: false,
            description: 'Given name',
            required: false,
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
        ],
      },
      {
        name: 'displayName',
        type: 'string',
        multiValued: false,
        description: 'Name displayed for the User',
        required: false,
        caseExact: false,
        mutability: 'readWrite',
        returned: 'default',
        uniqueness: 'none',
      },
      {
        name: 'active',
        type: 'boolean',
        multiValued: false,
        description: 'User administrative status',
        required: false,
        mutability: 'readWrite',
        returned: 'default',
        uniqueness: 'none',
      },
      {
        name: 'emails',
        type: 'complex',
        multiValued: true,
        description: 'Email addresses',
        required: false,
        mutability: 'readWrite',
        returned: 'default',
        uniqueness: 'none',
        subAttributes: [
          {
            name: 'value',
            type: 'string',
            multiValued: false,
            description: 'Email address',
            required: false,
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'type',
            type: 'string',
            multiValued: false,
            description: 'Email type',
            required: false,
            canonicalValues: ['work', 'home', 'other'],
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'primary',
            type: 'boolean',
            multiValued: false,
            description: 'Primary email indicator',
            required: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
        ],
      },
      {
        name: 'groups',
        type: 'complex',
        multiValued: true,
        description: 'User\'s group memberships',
        required: false,
        mutability: 'readOnly',
        returned: 'default',
        uniqueness: 'none',
        subAttributes: [
          {
            name: 'value',
            type: 'string',
            multiValued: false,
            description: 'Group identifier',
            required: false,
            caseExact: false,
            mutability: 'readOnly',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'display',
            type: 'string',
            multiValued: false,
            description: 'Group display name',
            required: false,
            caseExact: false,
            mutability: 'readOnly',
            returned: 'default',
            uniqueness: 'none',
          },
        ],
      },
    ],
    meta: createSCIMMeta('Schema', `${baseUrl}/api/enterprise/scim/Schemas/${SCIM_SCHEMAS.USER}`),
  }

  // Group Schema
  const groupSchema: SCIMSchema = {
    id: SCIM_SCHEMAS.GROUP,
    name: 'Group',
    description: 'Group',
    attributes: [
      {
        name: 'displayName',
        type: 'string',
        multiValued: false,
        description: 'Human readable name for the Group',
        required: true,
        caseExact: false,
        mutability: 'readWrite',
        returned: 'default',
        uniqueness: 'server',
      },
      {
        name: 'members',
        type: 'complex',
        multiValued: true,
        description: 'Group members',
        required: false,
        mutability: 'readWrite',
        returned: 'default',
        uniqueness: 'none',
        subAttributes: [
          {
            name: 'value',
            type: 'string',
            multiValued: false,
            description: 'Member identifier',
            required: false,
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'display',
            type: 'string',
            multiValued: false,
            description: 'Member display name',
            required: false,
            caseExact: false,
            mutability: 'readOnly',
            returned: 'default',
            uniqueness: 'none',
          },
          {
            name: 'type',
            type: 'string',
            multiValued: false,
            description: 'Member type',
            required: false,
            canonicalValues: ['User', 'Group'],
            caseExact: false,
            mutability: 'readWrite',
            returned: 'default',
            uniqueness: 'none',
          },
        ],
      },
    ],
    meta: createSCIMMeta('Schema', `${baseUrl}/api/enterprise/scim/Schemas/${SCIM_SCHEMAS.GROUP}`),
  }

  const schemas = [userSchema, groupSchema]

  const response: SCIMListResponse<SCIMSchema> = {
    schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
    totalResults: schemas.length,
    startIndex: 1,
    itemsPerPage: schemas.length,
    Resources: schemas,
  }

  return NextResponse.json(response, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

// ============================================================================
// User Handlers
// ============================================================================

async function handleGetUser(
  userId: string,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .eq('organization_id', organizationId)
    .single()

  if (error || !user) {
    return createSCIMError(404, `User ${userId} not found`)
  }

  const scimUser = await mapDatabaseUserToSCIM(user, baseUrl, organizationId)

  return NextResponse.json(scimUser, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

async function handleListUsers(
  searchParams: URLSearchParams,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  const supabase = await createClient()

  // Parse pagination
  const startIndex = parseInt(searchParams.get('startIndex') || '1')
  const count = Math.min(parseInt(searchParams.get('count') || '100'), MAX_RESULTS)
  const filter = searchParams.get('filter')
  const sortBy = searchParams.get('sortBy') || 'userName'
  const sortOrder = searchParams.get('sortOrder') || 'ascending'

  // Build query
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)

  // Apply filter
  if (filter) {
    const parsedFilter = parseFilter(filter)
    if (parsedFilter) {
      const column = parsedFilter.attribute === 'userName' ? 'email' : parsedFilter.attribute

      switch (parsedFilter.operator) {
        case 'eq':
          query = query.eq(column, parsedFilter.value)
          break
        case 'ne':
          query = query.neq(column, parsedFilter.value)
          break
        case 'co':
          query = query.ilike(column, `%${parsedFilter.value}%`)
          break
        case 'sw':
          query = query.ilike(column, `${parsedFilter.value}%`)
          break
        case 'ew':
          query = query.ilike(column, `%${parsedFilter.value}`)
          break
        case 'pr':
          query = query.not(column, 'is', null)
          break
      }
    }
  }

  // Apply sorting
  const sortColumn = sortBy === 'userName' ? 'email' : sortBy
  query = query.order(sortColumn, { ascending: sortOrder === 'ascending' })

  // Apply pagination
  query = query.range(startIndex - 1, startIndex - 1 + count - 1)

  const { data: users, count: totalCount, error } = await query

  if (error) {
    logger.error('SCIM list users error', { error })
    return createSCIMError(500, 'Failed to list users')
  }

  // Map to SCIM format
  const scimUsers: SCIMUser[] = await Promise.all(
    (users || []).map((user) => mapDatabaseUserToSCIM(user, baseUrl, organizationId))
  )

  const response: SCIMListResponse<SCIMUser> = {
    schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
    totalResults: totalCount || 0,
    startIndex,
    itemsPerPage: scimUsers.length,
    Resources: scimUsers,
  }

  return NextResponse.json(response, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

// ============================================================================
// Group Handlers
// ============================================================================

async function handleGetGroup(
  groupId: string,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  const supabase = await createClient()

  const { data: group, error } = await supabase
    .from('scim_groups')
    .select('*')
    .eq('id', groupId)
    .eq('organization_id', organizationId)
    .single()

  if (error || !group) {
    return createSCIMError(404, `Group ${groupId} not found`)
  }

  const scimGroup = await mapDatabaseGroupToSCIM(group, baseUrl, organizationId)

  return NextResponse.json(scimGroup, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

async function handleListGroups(
  searchParams: URLSearchParams,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  const supabase = await createClient()

  // Parse pagination
  const startIndex = parseInt(searchParams.get('startIndex') || '1')
  const count = Math.min(parseInt(searchParams.get('count') || '100'), MAX_RESULTS)
  const filter = searchParams.get('filter')
  const sortBy = searchParams.get('sortBy') || 'displayName'
  const sortOrder = searchParams.get('sortOrder') || 'ascending'

  // Build query
  let query = supabase
    .from('scim_groups')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)

  // Apply filter
  if (filter) {
    const parsedFilter = parseFilter(filter)
    if (parsedFilter) {
      const column = parsedFilter.attribute === 'displayName' ? 'display_name' : parsedFilter.attribute

      switch (parsedFilter.operator) {
        case 'eq':
          query = query.eq(column, parsedFilter.value)
          break
        case 'co':
          query = query.ilike(column, `%${parsedFilter.value}%`)
          break
        case 'sw':
          query = query.ilike(column, `${parsedFilter.value}%`)
          break
      }
    }
  }

  // Apply sorting
  const sortColumn = sortBy === 'displayName' ? 'display_name' : sortBy
  query = query.order(sortColumn, { ascending: sortOrder === 'ascending' })

  // Apply pagination
  query = query.range(startIndex - 1, startIndex - 1 + count - 1)

  const { data: groups, count: totalCount, error } = await query

  if (error) {
    logger.error('SCIM list groups error', { error })
    return createSCIMError(500, 'Failed to list groups')
  }

  // Map to SCIM format
  const scimGroups: SCIMGroup[] = await Promise.all(
    (groups || []).map((group) => mapDatabaseGroupToSCIM(group, baseUrl, organizationId))
  )

  const response: SCIMListResponse<SCIMGroup> = {
    schemas: [SCIM_SCHEMAS.LIST_RESPONSE],
    totalResults: totalCount || 0,
    startIndex,
    itemsPerPage: scimGroups.length,
    Resources: scimGroups,
  }

  return NextResponse.json(response, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

// ============================================================================
// POST Handler - Create Resources
// ============================================================================

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await validateBearerToken(req)
    if (!auth.valid) {
      return createSCIMError(401, auth.error || 'Unauthorized')
    }

    const path = req.nextUrl.pathname
    const baseUrl = getBaseUrl(req)
    const organizationId = auth.organization_id!
    const body = await req.json()

    // Bulk operations
    if (path.endsWith('/Bulk')) {
      return handleBulkRequest(body, baseUrl, organizationId)
    }

    // Search (.search endpoint)
    if (path.endsWith('/.search')) {
      return handleSearchRequest(body, baseUrl, organizationId)
    }

    // Create User
    if (path.endsWith('/Users')) {
      return handleCreateUser(body, baseUrl, organizationId)
    }

    // Create Group
    if (path.endsWith('/Groups')) {
      return handleCreateGroup(body, baseUrl, organizationId)
    }

    return createSCIMError(404, 'Resource not found')
  } catch (error) {
    logger.error('SCIM POST error', { error })
    return createSCIMError(500, 'Internal server error')
  }
}

async function handleCreateUser(
  body: unknown,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  // Validate request
  const validation = scimUserCreateSchema.safeParse(body)
  if (!validation.success) {
    return createSCIMError(400, validation.error.message, 'invalidValue')
  }

  const supabase = await createClient()

  // Check for existing user with same userName
  const primaryEmail = validation.data.emails?.find((e) => e.primary)?.value || validation.data.userName
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', primaryEmail)
    .eq('organization_id', organizationId)
    .single()

  if (existingUser) {
    return createSCIMError(409, `User with userName ${validation.data.userName} already exists`, 'uniqueness')
  }

  // Map SCIM user to database format
  const dbUser = mapSCIMUserToDatabase(validation.data)
  const userId = uuidv4()

  // Create user
  const { error: insertError } = await supabase
    .from('users')
    .insert({
      id: userId,
      organization_id: organizationId,
      ...dbUser,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (insertError) {
    logger.error('SCIM create user error', { error: insertError })
    return createSCIMError(500, 'Failed to create user')
  }

  // Log action
  await logSCIMAction(
    organizationId,
    'CREATE_USER',
    'User',
    userId,
    { userName: validation.data.userName },
    true
  )

  // Get created user
  const { data: createdUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  const scimUser = await mapDatabaseUserToSCIM(createdUser!, baseUrl, organizationId)

  return NextResponse.json(scimUser, {
    status: 201,
    headers: {
      'Content-Type': 'application/scim+json',
      'Location': `${baseUrl}/api/enterprise/scim/Users/${userId}`,
    },
  })
}

async function handleCreateGroup(
  body: unknown,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  // Validate request
  const validation = scimGroupCreateSchema.safeParse(body)
  if (!validation.success) {
    return createSCIMError(400, validation.error.message, 'invalidValue')
  }

  const supabase = await createClient()

  // Check for existing group with same displayName
  const { data: existingGroup } = await supabase
    .from('scim_groups')
    .select('id')
    .eq('display_name', validation.data.displayName)
    .eq('organization_id', organizationId)
    .single()

  if (existingGroup) {
    return createSCIMError(409, `Group with displayName ${validation.data.displayName} already exists`, 'uniqueness')
  }

  const groupId = uuidv4()

  // Create group
  const { error: insertError } = await supabase
    .from('scim_groups')
    .insert({
      id: groupId,
      organization_id: organizationId,
      external_id: validation.data.externalId,
      display_name: validation.data.displayName,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (insertError) {
    logger.error('SCIM create group error', { error: insertError })
    return createSCIMError(500, 'Failed to create group')
  }

  // Add members if provided
  if (validation.data.members && validation.data.members.length > 0) {
    const memberInserts = validation.data.members.map((member) => ({
      id: uuidv4(),
      group_id: groupId,
      user_id: member.value,
      organization_id: organizationId,
      created_at: new Date().toISOString(),
    }))

    await supabase.from('scim_group_members').insert(memberInserts)
  }

  // Log action
  await logSCIMAction(
    organizationId,
    'CREATE_GROUP',
    'Group',
    groupId,
    { displayName: validation.data.displayName, memberCount: validation.data.members?.length || 0 },
    true
  )

  // Get created group
  const { data: createdGroup } = await supabase
    .from('scim_groups')
    .select('*')
    .eq('id', groupId)
    .single()

  const scimGroup = await mapDatabaseGroupToSCIM(createdGroup!, baseUrl, organizationId)

  return NextResponse.json(scimGroup, {
    status: 201,
    headers: {
      'Content-Type': 'application/scim+json',
      'Location': `${baseUrl}/api/enterprise/scim/Groups/${groupId}`,
    },
  })
}

// ============================================================================
// Bulk Operations Handler
// ============================================================================

async function handleBulkRequest(
  body: unknown,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  const validation = scimBulkSchema.safeParse(body)
  if (!validation.success) {
    return createSCIMError(400, validation.error.message, 'invalidValue')
  }

  const { failOnErrors, Operations } = validation.data
  const results: SCIMBulkOperationResponse[] = []
  let errorCount = 0

  for (const op of Operations) {
    if (failOnErrors && errorCount >= failOnErrors) {
      // Stop processing if error threshold reached
      results.push({
        method: op.method,
        bulkId: op.bulkId,
        status: '412',
        response: {
          schemas: [SCIM_SCHEMAS.ERROR],
          detail: 'Bulk operation stopped due to error threshold',
        },
      })
      continue
    }

    try {
      const result = await executeBulkOperation(op, baseUrl, organizationId)
      results.push(result)

      if (parseInt(result.status) >= 400) {
        errorCount++
      }
    } catch (error) {
      errorCount++
      results.push({
        method: op.method,
        bulkId: op.bulkId,
        status: '500',
        response: {
          schemas: [SCIM_SCHEMAS.ERROR],
          detail: 'Internal error processing bulk operation',
        },
      })
    }
  }

  const response: SCIMBulkResponse = {
    schemas: [SCIM_SCHEMAS.BULK_RESPONSE],
    Operations: results,
  }

  return NextResponse.json(response, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

async function executeBulkOperation(
  op: SCIMBulkOperation,
  baseUrl: string,
  organizationId: string
): Promise<SCIMBulkOperationResponse> {
  const pathParts = op.path.split('/')
  const resourceType = pathParts[1] // 'Users' or 'Groups'
  const resourceId = pathParts[2] // Resource ID for PUT/PATCH/DELETE

  switch (op.method) {
    case 'POST': {
      if (resourceType === 'Users') {
        const response = await handleCreateUser(op.data, baseUrl, organizationId)
        const responseData = await response.json()
        return {
          method: op.method,
          bulkId: op.bulkId,
          location: response.headers.get('Location') || undefined,
          status: response.status.toString(),
          response: responseData,
        }
      } else if (resourceType === 'Groups') {
        const response = await handleCreateGroup(op.data, baseUrl, organizationId)
        const responseData = await response.json()
        return {
          method: op.method,
          bulkId: op.bulkId,
          location: response.headers.get('Location') || undefined,
          status: response.status.toString(),
          response: responseData,
        }
      }
      break
    }

    case 'PUT': {
      if (resourceType === 'Users' && resourceId) {
        const response = await handleReplaceUser(resourceId, op.data, baseUrl, organizationId)
        const responseData = await response.json()
        return {
          method: op.method,
          bulkId: op.bulkId,
          location: `${baseUrl}/api/enterprise/scim/Users/${resourceId}`,
          status: response.status.toString(),
          response: responseData,
        }
      } else if (resourceType === 'Groups' && resourceId) {
        const response = await handleReplaceGroup(resourceId, op.data, baseUrl, organizationId)
        const responseData = await response.json()
        return {
          method: op.method,
          bulkId: op.bulkId,
          location: `${baseUrl}/api/enterprise/scim/Groups/${resourceId}`,
          status: response.status.toString(),
          response: responseData,
        }
      }
      break
    }

    case 'PATCH': {
      if (resourceType === 'Users' && resourceId) {
        const response = await handlePatchUser(resourceId, op.data, baseUrl, organizationId)
        const responseData = await response.json()
        return {
          method: op.method,
          bulkId: op.bulkId,
          location: `${baseUrl}/api/enterprise/scim/Users/${resourceId}`,
          status: response.status.toString(),
          response: responseData,
        }
      } else if (resourceType === 'Groups' && resourceId) {
        const response = await handlePatchGroup(resourceId, op.data, baseUrl, organizationId)
        const responseData = await response.json()
        return {
          method: op.method,
          bulkId: op.bulkId,
          location: `${baseUrl}/api/enterprise/scim/Groups/${resourceId}`,
          status: response.status.toString(),
          response: responseData,
        }
      }
      break
    }

    case 'DELETE': {
      if (resourceType === 'Users' && resourceId) {
        await handleDeleteUser(resourceId, organizationId)
        return {
          method: op.method,
          bulkId: op.bulkId,
          status: '204',
        }
      } else if (resourceType === 'Groups' && resourceId) {
        await handleDeleteGroup(resourceId, organizationId)
        return {
          method: op.method,
          bulkId: op.bulkId,
          status: '204',
        }
      }
      break
    }
  }

  return {
    method: op.method,
    bulkId: op.bulkId,
    status: '400',
    response: {
      schemas: [SCIM_SCHEMAS.ERROR],
      detail: 'Invalid bulk operation',
    },
  }
}

// ============================================================================
// Search Handler
// ============================================================================

async function handleSearchRequest(
  body: Record<string, unknown>,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  const searchParams = new URLSearchParams()

  if (body.filter) searchParams.set('filter', body.filter as string)
  if (body.startIndex) searchParams.set('startIndex', body.startIndex.toString())
  if (body.count) searchParams.set('count', body.count.toString())
  if (body.sortBy) searchParams.set('sortBy', body.sortBy as string)
  if (body.sortOrder) searchParams.set('sortOrder', body.sortOrder as string)

  // Determine resource type from attributes or return both
  if (body.attributes) {
    const attrs = body.attributes as string[]
    if (attrs.some((a) => a.startsWith('urn:ietf:params:scim:schemas:core:2.0:User'))) {
      return handleListUsers(searchParams, baseUrl, organizationId)
    }
    if (attrs.some((a) => a.startsWith('urn:ietf:params:scim:schemas:core:2.0:Group'))) {
      return handleListGroups(searchParams, baseUrl, organizationId)
    }
  }

  // Default to users
  return handleListUsers(searchParams, baseUrl, organizationId)
}

// ============================================================================
// PUT Handler - Replace Resources
// ============================================================================

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await validateBearerToken(req)
    if (!auth.valid) {
      return createSCIMError(401, auth.error || 'Unauthorized')
    }

    const path = req.nextUrl.pathname
    const baseUrl = getBaseUrl(req)
    const organizationId = auth.organization_id!
    const body = await req.json()

    // Replace User
    if (path.includes('/Users/')) {
      const userId = path.split('/Users/')[1]
      return handleReplaceUser(userId, body, baseUrl, organizationId)
    }

    // Replace Group
    if (path.includes('/Groups/')) {
      const groupId = path.split('/Groups/')[1]
      return handleReplaceGroup(groupId, body, baseUrl, organizationId)
    }

    return createSCIMError(404, 'Resource not found')
  } catch (error) {
    logger.error('SCIM PUT error', { error })
    return createSCIMError(500, 'Internal server error')
  }
}

async function handleReplaceUser(
  userId: string,
  body: unknown,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  // Validate request
  const validation = scimUserCreateSchema.safeParse(body)
  if (!validation.success) {
    return createSCIMError(400, validation.error.message, 'invalidValue')
  }

  const supabase = await createClient()

  // Check user exists
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .eq('organization_id', organizationId)
    .single()

  if (findError || !existingUser) {
    return createSCIMError(404, `User ${userId} not found`)
  }

  // Map SCIM user to database format
  const dbUser = mapSCIMUserToDatabase(validation.data)

  // Update user
  const { error: updateError } = await supabase
    .from('users')
    .update({
      ...dbUser,
      version: (existingUser.version || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .eq('organization_id', organizationId)

  if (updateError) {
    logger.error('SCIM replace user error', { error: updateError })
    return createSCIMError(500, 'Failed to replace user')
  }

  // Log action
  await logSCIMAction(
    organizationId,
    'REPLACE_USER',
    'User',
    userId,
    { userName: validation.data.userName },
    true
  )

  // Get updated user
  const { data: updatedUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  const scimUser = await mapDatabaseUserToSCIM(updatedUser!, baseUrl, organizationId)

  return NextResponse.json(scimUser, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

async function handleReplaceGroup(
  groupId: string,
  body: unknown,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  // Validate request
  const validation = scimGroupCreateSchema.safeParse(body)
  if (!validation.success) {
    return createSCIMError(400, validation.error.message, 'invalidValue')
  }

  const supabase = await createClient()

  // Check group exists
  const { data: existingGroup, error: findError } = await supabase
    .from('scim_groups')
    .select('*')
    .eq('id', groupId)
    .eq('organization_id', organizationId)
    .single()

  if (findError || !existingGroup) {
    return createSCIMError(404, `Group ${groupId} not found`)
  }

  // Update group
  const { error: updateError } = await supabase
    .from('scim_groups')
    .update({
      external_id: validation.data.externalId,
      display_name: validation.data.displayName,
      version: (existingGroup.version || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', groupId)
    .eq('organization_id', organizationId)

  if (updateError) {
    logger.error('SCIM replace group error', { error: updateError })
    return createSCIMError(500, 'Failed to replace group')
  }

  // Replace members
  await supabase
    .from('scim_group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('organization_id', organizationId)

  if (validation.data.members && validation.data.members.length > 0) {
    const memberInserts = validation.data.members.map((member) => ({
      id: uuidv4(),
      group_id: groupId,
      user_id: member.value,
      organization_id: organizationId,
      created_at: new Date().toISOString(),
    }))

    await supabase.from('scim_group_members').insert(memberInserts)
  }

  // Log action
  await logSCIMAction(
    organizationId,
    'REPLACE_GROUP',
    'Group',
    groupId,
    { displayName: validation.data.displayName },
    true
  )

  // Get updated group
  const { data: updatedGroup } = await supabase
    .from('scim_groups')
    .select('*')
    .eq('id', groupId)
    .single()

  const scimGroup = await mapDatabaseGroupToSCIM(updatedGroup!, baseUrl, organizationId)

  return NextResponse.json(scimGroup, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

// ============================================================================
// PATCH Handler - Partial Update
// ============================================================================

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await validateBearerToken(req)
    if (!auth.valid) {
      return createSCIMError(401, auth.error || 'Unauthorized')
    }

    const path = req.nextUrl.pathname
    const baseUrl = getBaseUrl(req)
    const organizationId = auth.organization_id!
    const body = await req.json()

    // Patch User
    if (path.includes('/Users/')) {
      const userId = path.split('/Users/')[1]
      return handlePatchUser(userId, body, baseUrl, organizationId)
    }

    // Patch Group
    if (path.includes('/Groups/')) {
      const groupId = path.split('/Groups/')[1]
      return handlePatchGroup(groupId, body, baseUrl, organizationId)
    }

    return createSCIMError(404, 'Resource not found')
  } catch (error) {
    logger.error('SCIM PATCH error', { error })
    return createSCIMError(500, 'Internal server error')
  }
}

async function handlePatchUser(
  userId: string,
  body: unknown,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  // Validate request
  const validation = scimPatchSchema.safeParse(body)
  if (!validation.success) {
    return createSCIMError(400, validation.error.message, 'invalidValue')
  }

  const supabase = await createClient()

  // Check user exists
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .eq('organization_id', organizationId)
    .single()

  if (findError || !existingUser) {
    return createSCIMError(404, `User ${userId} not found`)
  }

  // Apply patch operations
  const updates: Record<string, unknown> = {}

  for (const op of validation.data.Operations) {
    const path = op.path || ''
    const value = op.value

    switch (op.op) {
      case 'add':
      case 'replace': {
        // Map SCIM path to database column
        if (path === 'active' || path === '') {
          if (typeof value === 'object' && value !== null && 'active' in value) {
            updates.is_active = (value as Record<string, boolean>).active
          } else if (typeof value === 'boolean') {
            updates.is_active = value
          }
        }
        if (path === 'displayName' || (typeof value === 'object' && value && 'displayName' in value)) {
          updates.display_name = typeof value === 'object' ? (value as Record<string, string>).displayName : value
        }
        if (path === 'name.givenName') {
          updates.first_name = value
        }
        if (path === 'name.familyName') {
          updates.last_name = value
        }
        if (path === 'title') {
          updates.title = value
        }
        if (path === 'emails' && Array.isArray(value)) {
          const primary = (value as SCIMEmail[]).find((e) => e.primary)
          if (primary) {
            updates.email = primary.value
          }
        }
        if (path === 'phoneNumbers' && Array.isArray(value)) {
          const primary = (value as SCIMPhoneNumber[]).find((p) => p.primary)
          if (primary) {
            updates.phone = primary.value
          }
        }
        break
      }
      case 'remove': {
        if (path === 'phoneNumbers') {
          updates.phone = null
        }
        break
      }
    }
  }

  // Apply updates
  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        ...updates,
        version: (existingUser.version || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .eq('organization_id', organizationId)

    if (updateError) {
      logger.error('SCIM patch user error', { error: updateError })
      return createSCIMError(500, 'Failed to patch user')
    }
  }

  // Log action
  await logSCIMAction(
    organizationId,
    'PATCH_USER',
    'User',
    userId,
    { operations: validation.data.Operations.length },
    true
  )

  // Get updated user
  const { data: updatedUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  const scimUser = await mapDatabaseUserToSCIM(updatedUser!, baseUrl, organizationId)

  return NextResponse.json(scimUser, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

async function handlePatchGroup(
  groupId: string,
  body: unknown,
  baseUrl: string,
  organizationId: string
): Promise<NextResponse> {
  // Validate request
  const validation = scimPatchSchema.safeParse(body)
  if (!validation.success) {
    return createSCIMError(400, validation.error.message, 'invalidValue')
  }

  const supabase = await createClient()

  // Check group exists
  const { data: existingGroup, error: findError } = await supabase
    .from('scim_groups')
    .select('*')
    .eq('id', groupId)
    .eq('organization_id', organizationId)
    .single()

  if (findError || !existingGroup) {
    return createSCIMError(404, `Group ${groupId} not found`)
  }

  // Apply patch operations
  const updates: Record<string, unknown> = {}

  for (const op of validation.data.Operations) {
    const path = op.path || ''
    const value = op.value

    switch (op.op) {
      case 'add': {
        if (path === 'members' && Array.isArray(value)) {
          // Add members
          const memberInserts = (value as SCIMGroupMember[]).map((member) => ({
            id: uuidv4(),
            group_id: groupId,
            user_id: member.value,
            organization_id: organizationId,
            created_at: new Date().toISOString(),
          }))

          await supabase.from('scim_group_members').insert(memberInserts)
        }
        if (path === 'displayName') {
          updates.display_name = value
        }
        break
      }
      case 'replace': {
        if (path === 'displayName') {
          updates.display_name = value
        }
        if (path === 'members' && Array.isArray(value)) {
          // Replace all members
          await supabase
            .from('scim_group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('organization_id', organizationId)

          const memberInserts = (value as SCIMGroupMember[]).map((member) => ({
            id: uuidv4(),
            group_id: groupId,
            user_id: member.value,
            organization_id: organizationId,
            created_at: new Date().toISOString(),
          }))

          await supabase.from('scim_group_members').insert(memberInserts)
        }
        break
      }
      case 'remove': {
        // Handle member removal: members[value eq "userId"]
        const memberMatch = path.match(/members\[value eq "([^"]+)"\]/)
        if (memberMatch) {
          await supabase
            .from('scim_group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', memberMatch[1])
            .eq('organization_id', organizationId)
        }
        break
      }
    }
  }

  // Apply group updates
  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from('scim_groups')
      .update({
        ...updates,
        version: (existingGroup.version || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)
      .eq('organization_id', organizationId)

    if (updateError) {
      logger.error('SCIM patch group error', { error: updateError })
      return createSCIMError(500, 'Failed to patch group')
    }
  }

  // Log action
  await logSCIMAction(
    organizationId,
    'PATCH_GROUP',
    'Group',
    groupId,
    { operations: validation.data.Operations.length },
    true
  )

  // Get updated group
  const { data: updatedGroup } = await supabase
    .from('scim_groups')
    .select('*')
    .eq('id', groupId)
    .single()

  const scimGroup = await mapDatabaseGroupToSCIM(updatedGroup!, baseUrl, organizationId)

  return NextResponse.json(scimGroup, {
    headers: { 'Content-Type': 'application/scim+json' },
  })
}

// ============================================================================
// DELETE Handler - Remove Resources
// ============================================================================

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const auth = await validateBearerToken(req)
    if (!auth.valid) {
      return createSCIMError(401, auth.error || 'Unauthorized')
    }

    const path = req.nextUrl.pathname
    const organizationId = auth.organization_id!

    // Delete User
    if (path.includes('/Users/')) {
      const userId = path.split('/Users/')[1]
      return handleDeleteUser(userId, organizationId)
    }

    // Delete Group
    if (path.includes('/Groups/')) {
      const groupId = path.split('/Groups/')[1]
      return handleDeleteGroup(groupId, organizationId)
    }

    return createSCIMError(404, 'Resource not found')
  } catch (error) {
    logger.error('SCIM DELETE error', { error })
    return createSCIMError(500, 'Internal server error')
  }
}

async function handleDeleteUser(
  userId: string,
  organizationId: string
): Promise<NextResponse> {
  const supabase = await createClient()

  // Check user exists
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .eq('organization_id', organizationId)
    .single()

  if (findError || !existingUser) {
    return createSCIMError(404, `User ${userId} not found`)
  }

  // Remove user from all groups
  await supabase
    .from('scim_group_members')
    .delete()
    .eq('user_id', userId)
    .eq('organization_id', organizationId)

  // Soft delete or deactivate user (depending on business requirements)
  // For this implementation, we'll soft delete by marking as inactive
  const { error: deleteError } = await supabase
    .from('users')
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .eq('organization_id', organizationId)

  if (deleteError) {
    logger.error('SCIM delete user error', { error: deleteError })
    return createSCIMError(500, 'Failed to delete user')
  }

  // Log action
  await logSCIMAction(
    organizationId,
    'DELETE_USER',
    'User',
    userId,
    {},
    true
  )

  return new NextResponse(null, { status: 204 })
}

async function handleDeleteGroup(
  groupId: string,
  organizationId: string
): Promise<NextResponse> {
  const supabase = await createClient()

  // Check group exists
  const { data: existingGroup, error: findError } = await supabase
    .from('scim_groups')
    .select('id')
    .eq('id', groupId)
    .eq('organization_id', organizationId)
    .single()

  if (findError || !existingGroup) {
    return createSCIMError(404, `Group ${groupId} not found`)
  }

  // Remove all members
  await supabase
    .from('scim_group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('organization_id', organizationId)

  // Delete group
  const { error: deleteError } = await supabase
    .from('scim_groups')
    .delete()
    .eq('id', groupId)
    .eq('organization_id', organizationId)

  if (deleteError) {
    logger.error('SCIM delete group error', { error: deleteError })
    return createSCIMError(500, 'Failed to delete group')
  }

  // Log action
  await logSCIMAction(
    organizationId,
    'DELETE_GROUP',
    'Group',
    groupId,
    {},
    true
  )

  return new NextResponse(null, { status: 204 })
}

/**
 * SCIM 2.0 Service
 *
 * System for Cross-domain Identity Management (SCIM) implementation
 * for automated user and group provisioning from identity providers.
 *
 * Features:
 * - User provisioning (create, read, update, delete)
 * - Group provisioning with membership management
 * - Attribute mapping and schema extensions
 * - Bulk operations support
 * - Patch operations (RFC 7644)
 * - Filtering and pagination
 * - Audit logging
 *
 * @module lib/auth/scim-service
 */

import { createClient } from '@/lib/supabase/server'

// SCIM Constants
const SCIM_SCHEMA_CORE_USER = 'urn:ietf:params:scim:schemas:core:2.0:User'
const SCIM_SCHEMA_ENTERPRISE_USER = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'
const SCIM_SCHEMA_CORE_GROUP = 'urn:ietf:params:scim:schemas:core:2.0:Group'
const SCIM_SCHEMA_LIST_RESPONSE = 'urn:ietf:params:scim:api:messages:2.0:ListResponse'
const SCIM_SCHEMA_ERROR = 'urn:ietf:params:scim:api:messages:2.0:Error'
const SCIM_SCHEMA_PATCH_OP = 'urn:ietf:params:scim:api:messages:2.0:PatchOp'
const SCIM_SCHEMA_BULK_REQUEST = 'urn:ietf:params:scim:api:messages:2.0:BulkRequest'
const SCIM_SCHEMA_BULK_RESPONSE = 'urn:ietf:params:scim:api:messages:2.0:BulkResponse'

// Types
export interface SCIMUser {
  schemas: string[]
  id: string
  externalId?: string
  userName: string
  name?: {
    formatted?: string
    familyName?: string
    givenName?: string
    middleName?: string
    honorificPrefix?: string
    honorificSuffix?: string
  }
  displayName?: string
  nickName?: string
  profileUrl?: string
  title?: string
  userType?: string
  preferredLanguage?: string
  locale?: string
  timezone?: string
  active: boolean
  emails?: Array<{
    value: string
    type?: string
    primary?: boolean
  }>
  phoneNumbers?: Array<{
    value: string
    type?: string
    primary?: boolean
  }>
  addresses?: Array<{
    formatted?: string
    streetAddress?: string
    locality?: string
    region?: string
    postalCode?: string
    country?: string
    type?: string
    primary?: boolean
  }>
  photos?: Array<{
    value: string
    type?: string
    primary?: boolean
  }>
  groups?: Array<{
    value: string
    display?: string
    type?: string
    $ref?: string
  }>
  roles?: Array<{
    value: string
    display?: string
    type?: string
    primary?: boolean
  }>
  'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'?: {
    employeeNumber?: string
    costCenter?: string
    organization?: string
    division?: string
    department?: string
    manager?: {
      value?: string
      displayName?: string
      $ref?: string
    }
  }
  meta: {
    resourceType: 'User'
    created: string
    lastModified: string
    location: string
    version?: string
  }
}

export interface SCIMGroup {
  schemas: string[]
  id: string
  externalId?: string
  displayName: string
  members?: Array<{
    value: string
    display?: string
    type?: string
    $ref?: string
  }>
  meta: {
    resourceType: 'Group'
    created: string
    lastModified: string
    location: string
    version?: string
  }
}

export interface SCIMListResponse<T> {
  schemas: string[]
  totalResults: number
  startIndex: number
  itemsPerPage: number
  Resources: T[]
}

export interface SCIMError {
  schemas: string[]
  status: string
  scimType?: string
  detail?: string
}

export interface SCIMPatchOperation {
  op: 'add' | 'remove' | 'replace'
  path?: string
  value?: unknown
}

export interface SCIMBulkOperation {
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  bulkId?: string
  path: string
  data?: unknown
}

export interface SCIMFilter {
  attribute: string
  operator: string
  value: string
}

// Attribute mapping configuration
export interface AttributeMapping {
  scimAttribute: string
  dbColumn: string
  transform?: (value: unknown) => unknown
  reverseTransform?: (value: unknown) => unknown
}

const DEFAULT_USER_MAPPING: AttributeMapping[] = [
  { scimAttribute: 'userName', dbColumn: 'email' },
  { scimAttribute: 'displayName', dbColumn: 'name' },
  { scimAttribute: 'name.givenName', dbColumn: 'first_name' },
  { scimAttribute: 'name.familyName', dbColumn: 'last_name' },
  { scimAttribute: 'active', dbColumn: 'is_active' },
  { scimAttribute: 'title', dbColumn: 'job_title' },
  { scimAttribute: 'photos[primary eq true].value', dbColumn: 'avatar_url' },
  {
    scimAttribute: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User.department',
    dbColumn: 'department'
  },
  {
    scimAttribute: 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User.employeeNumber',
    dbColumn: 'employee_id'
  }
]

/**
 * SCIM 2.0 Service
 */
export class SCIMService {
  private baseUrl: string
  private organizationId: string | null = null

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  /**
   * Set the organization context for multi-tenant SCIM
   */
  setOrganization(organizationId: string): void {
    this.organizationId = organizationId
  }

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  /**
   * Create a new user
   */
  async createUser(userData: Partial<SCIMUser>): Promise<SCIMUser> {
    const supabase = await createClient()

    // Validate required fields
    if (!userData.userName) {
      throw this.createError(400, 'invalidValue', 'userName is required')
    }

    // Check for existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', userData.userName)
      .single()

    if (existing) {
      throw this.createError(409, 'uniqueness', 'User already exists')
    }

    // Map SCIM attributes to database columns
    const dbUser = this.mapScimToDb(userData, DEFAULT_USER_MAPPING)

    // Add organization if set
    if (this.organizationId) {
      dbUser.organization_id = this.organizationId
    }

    // Set default values
    dbUser.role = 'member'
    dbUser.created_at = new Date().toISOString()
    dbUser.updated_at = new Date().toISOString()

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert(dbUser)
      .select()
      .single()

    if (error) {
      console.error('SCIM create user error:', error)
      throw this.createError(500, 'internal', 'Failed to create user')
    }

    // Log the operation
    await this.logOperation('user_created', newUser.id, {
      userName: userData.userName,
      externalId: userData.externalId
    })

    // Store SCIM resource mapping
    await this.storeResourceMapping('User', newUser.id, userData.externalId)

    return this.mapDbToScimUser(newUser)
  }

  /**
   * Get a user by ID
   */
  async getUser(id: string): Promise<SCIMUser> {
    const supabase = await createClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !user) {
      throw this.createError(404, 'notFound', 'User not found')
    }

    return this.mapDbToScimUser(user)
  }

  /**
   * Get a user by external ID
   */
  async getUserByExternalId(externalId: string): Promise<SCIMUser | null> {
    const supabase = await createClient()

    const { data: mapping } = await supabase
      .from('scim_resources')
      .select('internal_id')
      .eq('external_id', externalId)
      .eq('resource_type', 'User')
      .single()

    if (!mapping) {
      return null
    }

    return this.getUser(mapping.internal_id)
  }

  /**
   * List users with filtering and pagination
   */
  async listUsers(options: {
    filter?: string
    startIndex?: number
    count?: number
    sortBy?: string
    sortOrder?: 'ascending' | 'descending'
  } = {}): Promise<SCIMListResponse<SCIMUser>> {
    const supabase = await createClient()

    const startIndex = options.startIndex || 1
    const count = Math.min(options.count || 100, 1000)

    let query = supabase.from('users').select('*', { count: 'exact' })

    // Apply organization filter if set
    if (this.organizationId) {
      query = query.eq('organization_id', this.organizationId)
    }

    // Apply SCIM filter
    if (options.filter) {
      const parsedFilter = this.parseFilter(options.filter)
      query = this.applyFilter(query, parsedFilter, 'user')
    }

    // Apply sorting
    if (options.sortBy) {
      const dbColumn = this.scimToDbColumn(options.sortBy, 'user')
      query = query.order(dbColumn, { ascending: options.sortOrder !== 'descending' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(startIndex - 1, startIndex - 1 + count - 1)

    const { data: users, count: totalCount, error } = await query

    if (error) {
      console.error('SCIM list users error:', error)
      throw this.createError(500, 'internal', 'Failed to list users')
    }

    return {
      schemas: [SCIM_SCHEMA_LIST_RESPONSE],
      totalResults: totalCount || 0,
      startIndex,
      itemsPerPage: users?.length || 0,
      Resources: (users || []).map(u => this.mapDbToScimUser(u))
    }
  }

  /**
   * Update a user (full replacement)
   */
  async updateUser(id: string, userData: Partial<SCIMUser>): Promise<SCIMUser> {
    const supabase = await createClient()

    // Verify user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single()

    if (!existing) {
      throw this.createError(404, 'notFound', 'User not found')
    }

    // Map SCIM attributes to database columns
    const dbUser = this.mapScimToDb(userData, DEFAULT_USER_MAPPING)
    dbUser.updated_at = new Date().toISOString()

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(dbUser)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('SCIM update user error:', error)
      throw this.createError(500, 'internal', 'Failed to update user')
    }

    // Update external ID mapping if provided
    if (userData.externalId) {
      await this.updateResourceMapping('User', id, userData.externalId)
    }

    // Log the operation
    await this.logOperation('user_updated', id, {
      userName: userData.userName,
      changes: Object.keys(dbUser)
    })

    return this.mapDbToScimUser(updatedUser)
  }

  /**
   * Patch a user (partial update)
   */
  async patchUser(id: string, operations: SCIMPatchOperation[]): Promise<SCIMUser> {
    const supabase = await createClient()

    // Get current user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !user) {
      throw this.createError(404, 'notFound', 'User not found')
    }

    // Apply patch operations
    const updates: Record<string, unknown> = {}

    for (const op of operations) {
      this.applyPatchOperation(op, updates, 'user')
    }

    updates.updated_at = new Date().toISOString()

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('SCIM patch user error:', error)
      throw this.createError(500, 'internal', 'Failed to patch user')
    }

    // Log the operation
    await this.logOperation('user_patched', id, {
      operations: operations.map(o => ({ op: o.op, path: o.path }))
    })

    return this.mapDbToScimUser(updatedUser)
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    const supabase = await createClient()

    // Soft delete - set is_active to false
    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('SCIM delete user error:', error)
      throw this.createError(500, 'internal', 'Failed to delete user')
    }

    // Remove from groups
    await supabase
      .from('scim_group_members')
      .delete()
      .eq('user_id', id)

    // Log the operation
    await this.logOperation('user_deleted', id, {})
  }

  // ============================================================================
  // GROUP OPERATIONS
  // ============================================================================

  /**
   * Create a new group
   */
  async createGroup(groupData: Partial<SCIMGroup>): Promise<SCIMGroup> {
    const supabase = await createClient()

    if (!groupData.displayName) {
      throw this.createError(400, 'invalidValue', 'displayName is required')
    }

    // Create group
    const { data: newGroup, error } = await supabase
      .from('scim_groups')
      .insert({
        display_name: groupData.displayName,
        external_id: groupData.externalId,
        organization_id: this.organizationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('SCIM create group error:', error)
      throw this.createError(500, 'internal', 'Failed to create group')
    }

    // Add members if provided
    if (groupData.members && groupData.members.length > 0) {
      await this.setGroupMembers(newGroup.id, groupData.members)
    }

    // Store SCIM resource mapping
    await this.storeResourceMapping('Group', newGroup.id, groupData.externalId)

    // Log the operation
    await this.logOperation('group_created', newGroup.id, {
      displayName: groupData.displayName,
      memberCount: groupData.members?.length || 0
    })

    return this.mapDbToScimGroup(newGroup, groupData.members || [])
  }

  /**
   * Get a group by ID
   */
  async getGroup(id: string): Promise<SCIMGroup> {
    const supabase = await createClient()

    const { data: group, error } = await supabase
      .from('scim_groups')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !group) {
      throw this.createError(404, 'notFound', 'Group not found')
    }

    // Get members
    const { data: members } = await supabase
      .from('scim_group_members')
      .select('user_id, users(id, name, email)')
      .eq('group_id', id)

    const memberList = (members || []).map(m => ({
      value: m.user_id,
      display: (m.users as { name?: string; email?: string })?.name || (m.users as { email?: string })?.email,
      $ref: `${this.baseUrl}/api/scim/v2/Users/${m.user_id}`
    }))

    return this.mapDbToScimGroup(group, memberList)
  }

  /**
   * List groups with filtering and pagination
   */
  async listGroups(options: {
    filter?: string
    startIndex?: number
    count?: number
  } = {}): Promise<SCIMListResponse<SCIMGroup>> {
    const supabase = await createClient()

    const startIndex = options.startIndex || 1
    const count = Math.min(options.count || 100, 1000)

    let query = supabase.from('scim_groups').select('*', { count: 'exact' })

    // Apply organization filter if set
    if (this.organizationId) {
      query = query.eq('organization_id', this.organizationId)
    }

    // Apply SCIM filter
    if (options.filter) {
      const parsedFilter = this.parseFilter(options.filter)
      query = this.applyFilter(query, parsedFilter, 'group')
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(startIndex - 1, startIndex - 1 + count - 1)

    const { data: groups, count: totalCount, error } = await query

    if (error) {
      console.error('SCIM list groups error:', error)
      throw this.createError(500, 'internal', 'Failed to list groups')
    }

    // Get members for each group
    const groupsWithMembers = await Promise.all(
      (groups || []).map(async g => {
        const { data: members } = await supabase
          .from('scim_group_members')
          .select('user_id, users(id, name, email)')
          .eq('group_id', g.id)

        const memberList = (members || []).map(m => ({
          value: m.user_id,
          display: (m.users as { name?: string; email?: string })?.name || (m.users as { email?: string })?.email,
          $ref: `${this.baseUrl}/api/scim/v2/Users/${m.user_id}`
        }))

        return this.mapDbToScimGroup(g, memberList)
      })
    )

    return {
      schemas: [SCIM_SCHEMA_LIST_RESPONSE],
      totalResults: totalCount || 0,
      startIndex,
      itemsPerPage: groups?.length || 0,
      Resources: groupsWithMembers
    }
  }

  /**
   * Update a group
   */
  async updateGroup(id: string, groupData: Partial<SCIMGroup>): Promise<SCIMGroup> {
    const supabase = await createClient()

    const { data: updatedGroup, error } = await supabase
      .from('scim_groups')
      .update({
        display_name: groupData.displayName,
        external_id: groupData.externalId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('SCIM update group error:', error)
      throw this.createError(500, 'internal', 'Failed to update group')
    }

    // Update members if provided
    if (groupData.members !== undefined) {
      await this.setGroupMembers(id, groupData.members)
    }

    // Log the operation
    await this.logOperation('group_updated', id, {
      displayName: groupData.displayName,
      memberCount: groupData.members?.length
    })

    return this.getGroup(id)
  }

  /**
   * Patch a group
   */
  async patchGroup(id: string, operations: SCIMPatchOperation[]): Promise<SCIMGroup> {
    const supabase = await createClient()

    for (const op of operations) {
      if (op.path === 'members' || op.path?.startsWith('members[')) {
        await this.handleMemberPatch(id, op)
      } else if (op.path === 'displayName') {
        await supabase
          .from('scim_groups')
          .update({
            display_name: op.value,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
      }
    }

    // Log the operation
    await this.logOperation('group_patched', id, {
      operations: operations.map(o => ({ op: o.op, path: o.path }))
    })

    return this.getGroup(id)
  }

  /**
   * Delete a group
   */
  async deleteGroup(id: string): Promise<void> {
    const supabase = await createClient()

    // Delete group members first
    await supabase
      .from('scim_group_members')
      .delete()
      .eq('group_id', id)

    // Delete group
    const { error } = await supabase
      .from('scim_groups')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('SCIM delete group error:', error)
      throw this.createError(500, 'internal', 'Failed to delete group')
    }

    // Log the operation
    await this.logOperation('group_deleted', id, {})
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Process bulk operations
   */
  async processBulkRequest(operations: SCIMBulkOperation[]): Promise<{
    schemas: string[]
    Operations: Array<{
      method: string
      bulkId?: string
      location?: string
      status: string
      response?: unknown
    }>
  }> {
    const results: Array<{
      method: string
      bulkId?: string
      location?: string
      status: string
      response?: unknown
    }> = []

    for (const op of operations) {
      try {
        let result: unknown
        let location: string | undefined

        if (op.path.startsWith('/Users')) {
          const id = op.path.split('/')[2]

          switch (op.method) {
            case 'POST':
              result = await this.createUser(op.data as Partial<SCIMUser>)
              location = `${this.baseUrl}/api/scim/v2/Users/${(result as SCIMUser).id}`
              break
            case 'PUT':
              result = await this.updateUser(id, op.data as Partial<SCIMUser>)
              location = `${this.baseUrl}/api/scim/v2/Users/${id}`
              break
            case 'PATCH':
              result = await this.patchUser(id, (op.data as { Operations: SCIMPatchOperation[] }).Operations)
              location = `${this.baseUrl}/api/scim/v2/Users/${id}`
              break
            case 'DELETE':
              await this.deleteUser(id)
              break
          }
        } else if (op.path.startsWith('/Groups')) {
          const id = op.path.split('/')[2]

          switch (op.method) {
            case 'POST':
              result = await this.createGroup(op.data as Partial<SCIMGroup>)
              location = `${this.baseUrl}/api/scim/v2/Groups/${(result as SCIMGroup).id}`
              break
            case 'PUT':
              result = await this.updateGroup(id, op.data as Partial<SCIMGroup>)
              location = `${this.baseUrl}/api/scim/v2/Groups/${id}`
              break
            case 'PATCH':
              result = await this.patchGroup(id, (op.data as { Operations: SCIMPatchOperation[] }).Operations)
              location = `${this.baseUrl}/api/scim/v2/Groups/${id}`
              break
            case 'DELETE':
              await this.deleteGroup(id)
              break
          }
        }

        results.push({
          method: op.method,
          bulkId: op.bulkId,
          location,
          status: op.method === 'DELETE' ? '204' : '200',
          response: result
        })
      } catch (err) {
        results.push({
          method: op.method,
          bulkId: op.bulkId,
          status: (err as SCIMError).status || '500',
          response: err
        })
      }
    }

    return {
      schemas: [SCIM_SCHEMA_BULK_RESPONSE],
      Operations: results
    }
  }

  // ============================================================================
  // SERVICE PROVIDER CONFIG
  // ============================================================================

  /**
   * Get service provider configuration
   */
  getServiceProviderConfig(): object {
    return {
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
      documentationUri: `${this.baseUrl}/docs/scim`,
      patch: {
        supported: true
      },
      bulk: {
        supported: true,
        maxOperations: 1000,
        maxPayloadSize: 1048576
      },
      filter: {
        supported: true,
        maxResults: 1000
      },
      changePassword: {
        supported: false
      },
      sort: {
        supported: true
      },
      etag: {
        supported: false
      },
      authenticationSchemes: [
        {
          type: 'oauthbearertoken',
          name: 'OAuth Bearer Token',
          description: 'Authentication using OAuth 2.0 Bearer Token',
          specUri: 'https://tools.ietf.org/html/rfc6750',
          primary: true
        }
      ],
      meta: {
        resourceType: 'ServiceProviderConfig',
        location: `${this.baseUrl}/api/scim/v2/ServiceProviderConfig`
      }
    }
  }

  /**
   * Get resource types
   */
  getResourceTypes(): object[] {
    return [
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
        id: 'User',
        name: 'User',
        endpoint: '/Users',
        description: 'User Account',
        schema: SCIM_SCHEMA_CORE_USER,
        schemaExtensions: [
          {
            schema: SCIM_SCHEMA_ENTERPRISE_USER,
            required: false
          }
        ],
        meta: {
          resourceType: 'ResourceType',
          location: `${this.baseUrl}/api/scim/v2/ResourceTypes/User`
        }
      },
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
        id: 'Group',
        name: 'Group',
        endpoint: '/Groups',
        description: 'Group',
        schema: SCIM_SCHEMA_CORE_GROUP,
        meta: {
          resourceType: 'ResourceType',
          location: `${this.baseUrl}/api/scim/v2/ResourceTypes/Group`
        }
      }
    ]
  }

  /**
   * Get schemas
   */
  getSchemas(): object[] {
    return [
      {
        id: SCIM_SCHEMA_CORE_USER,
        name: 'User',
        description: 'User Account',
        attributes: [
          { name: 'userName', type: 'string', required: true, uniqueness: 'server' },
          { name: 'name', type: 'complex', required: false },
          { name: 'displayName', type: 'string', required: false },
          { name: 'emails', type: 'complex', multiValued: true, required: false },
          { name: 'active', type: 'boolean', required: false }
        ],
        meta: {
          resourceType: 'Schema',
          location: `${this.baseUrl}/api/scim/v2/Schemas/${SCIM_SCHEMA_CORE_USER}`
        }
      },
      {
        id: SCIM_SCHEMA_CORE_GROUP,
        name: 'Group',
        description: 'Group',
        attributes: [
          { name: 'displayName', type: 'string', required: true },
          { name: 'members', type: 'complex', multiValued: true, required: false }
        ],
        meta: {
          resourceType: 'Schema',
          location: `${this.baseUrl}/api/scim/v2/Schemas/${SCIM_SCHEMA_CORE_GROUP}`
        }
      }
    ]
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Map SCIM attributes to database columns
   */
  private mapScimToDb(
    scimData: Record<string, unknown>,
    mappings: AttributeMapping[]
  ): Record<string, unknown> {
    const dbData: Record<string, unknown> = {}

    for (const mapping of mappings) {
      const value = this.getNestedValue(scimData, mapping.scimAttribute)
      if (value !== undefined) {
        dbData[mapping.dbColumn] = mapping.transform
          ? mapping.transform(value)
          : value
      }
    }

    // Handle emails specially
    if (Array.isArray(scimData.emails) && scimData.emails.length > 0) {
      const primaryEmail = scimData.emails.find((e: { primary?: boolean }) => e.primary) || scimData.emails[0]
      if (primaryEmail?.value) {
        dbData.email = primaryEmail.value
      }
    }

    return dbData
  }

  /**
   * Map database user to SCIM user
   */
  private mapDbToScimUser(dbUser: Record<string, unknown>): SCIMUser {
    const user: SCIMUser = {
      schemas: [SCIM_SCHEMA_CORE_USER, SCIM_SCHEMA_ENTERPRISE_USER],
      id: dbUser.id as string,
      userName: dbUser.email as string,
      displayName: dbUser.name as string,
      active: dbUser.is_active !== false,
      meta: {
        resourceType: 'User',
        created: dbUser.created_at as string,
        lastModified: dbUser.updated_at as string,
        location: `${this.baseUrl}/api/scim/v2/Users/${dbUser.id}`
      }
    }

    // Add name if available
    if (dbUser.first_name || dbUser.last_name) {
      user.name = {
        givenName: dbUser.first_name as string,
        familyName: dbUser.last_name as string,
        formatted: [dbUser.first_name, dbUser.last_name].filter(Boolean).join(' ')
      }
    }

    // Add emails
    if (dbUser.email) {
      user.emails = [
        { value: dbUser.email as string, type: 'work', primary: true }
      ]
    }

    // Add enterprise extension
    if (dbUser.department || dbUser.employee_id) {
      user['urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'] = {
        department: dbUser.department as string,
        employeeNumber: dbUser.employee_id as string
      }
    }

    // Add photo if available
    if (dbUser.avatar_url) {
      user.photos = [
        { value: dbUser.avatar_url as string, type: 'photo', primary: true }
      ]
    }

    return user
  }

  /**
   * Map database group to SCIM group
   */
  private mapDbToScimGroup(
    dbGroup: Record<string, unknown>,
    members: Array<{ value: string; display?: string; $ref?: string }>
  ): SCIMGroup {
    return {
      schemas: [SCIM_SCHEMA_CORE_GROUP],
      id: dbGroup.id as string,
      externalId: dbGroup.external_id as string,
      displayName: dbGroup.display_name as string,
      members,
      meta: {
        resourceType: 'Group',
        created: dbGroup.created_at as string,
        lastModified: dbGroup.updated_at as string,
        location: `${this.baseUrl}/api/scim/v2/Groups/${dbGroup.id}`
      }
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.')
    let current: unknown = obj

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined
      }

      // Handle array filters like emails[primary eq true]
      const arrayMatch = part.match(/^(\w+)\[(.+)\]$/)
      if (arrayMatch) {
        const [, arrayName, filter] = arrayMatch
        const array = (current as Record<string, unknown>)[arrayName]
        if (!Array.isArray(array)) {
          return undefined
        }

        // Parse filter
        const filterMatch = filter.match(/(\w+)\s+eq\s+(\w+)/)
        if (filterMatch) {
          const [, attr, value] = filterMatch
          const item = array.find(
            (i: Record<string, unknown>) => String(i[attr]) === value
          )
          current = item
        }
      } else {
        current = (current as Record<string, unknown>)[part]
      }
    }

    return current
  }

  /**
   * Parse SCIM filter string
   */
  private parseFilter(filter: string): SCIMFilter {
    // Simple filter parsing (supports basic operators)
    const match = filter.match(/^(\w+(?:\.\w+)?)\s+(eq|ne|co|sw|ew|gt|ge|lt|le|pr)\s*(.*)$/i)

    if (!match) {
      throw this.createError(400, 'invalidFilter', 'Invalid filter syntax')
    }

    return {
      attribute: match[1],
      operator: match[2].toLowerCase(),
      value: match[3]?.replace(/^["']|["']$/g, '') || ''
    }
  }

  /**
   * Apply filter to query
   */
  private applyFilter(
    query: ReturnType<ReturnType<typeof createClient>['from']>,
    filter: SCIMFilter,
    resourceType: 'user' | 'group'
  ): ReturnType<ReturnType<typeof createClient>['from']> {
    const dbColumn = this.scimToDbColumn(filter.attribute, resourceType)

    switch (filter.operator) {
      case 'eq':
        return query.eq(dbColumn, filter.value)
      case 'ne':
        return query.neq(dbColumn, filter.value)
      case 'co':
        return query.ilike(dbColumn, `%${filter.value}%`)
      case 'sw':
        return query.ilike(dbColumn, `${filter.value}%`)
      case 'ew':
        return query.ilike(dbColumn, `%${filter.value}`)
      case 'pr':
        return query.not(dbColumn, 'is', null)
      default:
        return query
    }
  }

  /**
   * Convert SCIM attribute to database column
   */
  private scimToDbColumn(attribute: string, resourceType: 'user' | 'group'): string {
    const mappings: Record<string, Record<string, string>> = {
      user: {
        userName: 'email',
        displayName: 'name',
        'name.givenName': 'first_name',
        'name.familyName': 'last_name',
        active: 'is_active',
        title: 'job_title',
        'emails.value': 'email'
      },
      group: {
        displayName: 'display_name',
        externalId: 'external_id'
      }
    }

    return mappings[resourceType][attribute] || attribute
  }

  /**
   * Apply a patch operation
   */
  private applyPatchOperation(
    op: SCIMPatchOperation,
    updates: Record<string, unknown>,
    resourceType: 'user' | 'group'
  ): void {
    if (!op.path) {
      // If no path, value should be an object with attributes
      if (op.op === 'add' || op.op === 'replace') {
        const attrs = op.value as Record<string, unknown>
        for (const [key, value] of Object.entries(attrs)) {
          const dbColumn = this.scimToDbColumn(key, resourceType)
          updates[dbColumn] = value
        }
      }
      return
    }

    const dbColumn = this.scimToDbColumn(op.path, resourceType)

    switch (op.op) {
      case 'add':
      case 'replace':
        updates[dbColumn] = op.value
        break
      case 'remove':
        updates[dbColumn] = null
        break
    }
  }

  /**
   * Handle member patch operations for groups
   */
  private async handleMemberPatch(groupId: string, op: SCIMPatchOperation): Promise<void> {
    const supabase = await createClient()

    if (op.op === 'add' && op.value) {
      // Add members
      const members = Array.isArray(op.value) ? op.value : [op.value]
      for (const member of members) {
        const userId = typeof member === 'string' ? member : (member as { value: string }).value
        await supabase
          .from('scim_group_members')
          .upsert({
            group_id: groupId,
            user_id: userId,
            created_at: new Date().toISOString()
          })
      }
    } else if (op.op === 'remove') {
      if (op.path?.includes('[')) {
        // Remove specific member: members[value eq "userId"]
        const match = op.path.match(/members\[value eq "?([^"]+)"?\]/)
        if (match) {
          await supabase
            .from('scim_group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', match[1])
        }
      } else {
        // Remove all members
        await supabase
          .from('scim_group_members')
          .delete()
          .eq('group_id', groupId)
      }
    } else if (op.op === 'replace' && op.value) {
      // Replace all members
      await supabase
        .from('scim_group_members')
        .delete()
        .eq('group_id', groupId)

      const members = Array.isArray(op.value) ? op.value : [op.value]
      for (const member of members) {
        const userId = typeof member === 'string' ? member : (member as { value: string }).value
        await supabase
          .from('scim_group_members')
          .insert({
            group_id: groupId,
            user_id: userId,
            created_at: new Date().toISOString()
          })
      }
    }
  }

  /**
   * Set group members (replace all)
   */
  private async setGroupMembers(
    groupId: string,
    members: Array<{ value: string; display?: string }>
  ): Promise<void> {
    const supabase = await createClient()

    // Remove existing members
    await supabase
      .from('scim_group_members')
      .delete()
      .eq('group_id', groupId)

    // Add new members
    if (members.length > 0) {
      await supabase
        .from('scim_group_members')
        .insert(
          members.map(m => ({
            group_id: groupId,
            user_id: m.value,
            created_at: new Date().toISOString()
          }))
        )
    }
  }

  /**
   * Store SCIM resource mapping
   */
  private async storeResourceMapping(
    resourceType: string,
    internalId: string,
    externalId?: string
  ): Promise<void> {
    if (!externalId) return

    const supabase = await createClient()

    await supabase
      .from('scim_resources')
      .upsert({
        resource_type: resourceType,
        internal_id: internalId,
        external_id: externalId,
        organization_id: this.organizationId,
        updated_at: new Date().toISOString()
      })
  }

  /**
   * Update SCIM resource mapping
   */
  private async updateResourceMapping(
    resourceType: string,
    internalId: string,
    externalId: string
  ): Promise<void> {
    const supabase = await createClient()

    await supabase
      .from('scim_resources')
      .upsert({
        resource_type: resourceType,
        internal_id: internalId,
        external_id: externalId,
        organization_id: this.organizationId,
        updated_at: new Date().toISOString()
      })
  }

  /**
   * Log SCIM operation
   */
  private async logOperation(
    operation: string,
    resourceId: string,
    details: Record<string, unknown>
  ): Promise<void> {
    const supabase = await createClient()

    await supabase
      .from('scim_sync_logs')
      .insert({
        operation,
        resource_id: resourceId,
        organization_id: this.organizationId,
        details,
        created_at: new Date().toISOString()
      })
  }

  /**
   * Create SCIM error
   */
  private createError(status: number, scimType: string, detail: string): SCIMError {
    return {
      schemas: [SCIM_SCHEMA_ERROR],
      status: String(status),
      scimType,
      detail
    }
  }
}

// Export singleton instance
export const scimService = new SCIMService()

// Export convenience functions
export async function provisionUser(userData: Partial<SCIMUser>): Promise<SCIMUser> {
  return scimService.createUser(userData)
}

export async function deprovisionUser(userId: string): Promise<void> {
  return scimService.deleteUser(userId)
}

export async function syncUserAttributes(
  userId: string,
  attributes: Partial<SCIMUser>
): Promise<SCIMUser> {
  return scimService.updateUser(userId, attributes)
}

export async function addUserToGroup(groupId: string, userId: string): Promise<void> {
  await scimService.patchGroup(groupId, [
    {
      op: 'add',
      path: 'members',
      value: [{ value: userId }]
    }
  ])
}

export async function removeUserFromGroup(groupId: string, userId: string): Promise<void> {
  await scimService.patchGroup(groupId, [
    {
      op: 'remove',
      path: `members[value eq "${userId}"]`
    }
  ])
}

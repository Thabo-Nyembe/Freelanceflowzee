/**
 * Directory Sync Service
 *
 * Synchronizes users and groups from external identity providers:
 * - Azure AD (Microsoft Entra ID)
 * - Google Workspace
 * - Okta
 * - OneLogin
 * - Generic LDAP
 *
 * Features:
 * - Full sync (initial import)
 * - Incremental sync (delta changes)
 * - Attribute mapping
 * - Group membership sync
 * - Conflict resolution
 * - Audit logging
 * - Scheduled sync jobs
 *
 * @module lib/auth/directory-sync
 */

import { createClient } from '@/lib/supabase/server'

// Directory Provider Types
export type DirectoryProvider = 'azure_ad' | 'google_workspace' | 'okta' | 'onelogin' | 'ldap' | 'custom'

export interface DirectoryConnection {
  id: string
  organizationId: string
  provider: DirectoryProvider
  name: string
  config: DirectoryConfig
  status: 'active' | 'inactive' | 'error'
  lastSyncAt: string | null
  lastSyncStatus: 'success' | 'partial' | 'failure' | null
  syncedUsers: number
  syncedGroups: number
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface DirectoryConfig {
  // Azure AD
  tenantId?: string
  clientId?: string
  clientSecret?: string

  // Google Workspace
  domain?: string
  serviceAccountKey?: string
  adminEmail?: string

  // Okta
  oktaDomain?: string
  apiToken?: string

  // OneLogin
  oneLoginDomain?: string
  oneLoginClientId?: string
  oneLoginClientSecret?: string

  // Generic LDAP
  ldapUrl?: string
  ldapBindDN?: string
  ldapBindPassword?: string
  ldapBaseDN?: string
  ldapUserFilter?: string
  ldapGroupFilter?: string

  // Sync settings
  syncUsers: boolean
  syncGroups: boolean
  autoProvision: boolean
  autoDeprovision: boolean
  syncInterval: number // minutes
  defaultRole: string
}

export interface AttributeMapping {
  id: string
  connectionId: string
  sourceAttribute: string
  targetAttribute: string
  transformFunction?: string
  isRequired: boolean
}

export interface DirectoryUser {
  externalId: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  jobTitle?: string
  department?: string
  manager?: string
  phone?: string
  avatar?: string
  active: boolean
  groups: string[]
  attributes: Record<string, unknown>
}

export interface DirectoryGroup {
  externalId: string
  name: string
  description?: string
  members: string[]
  attributes: Record<string, unknown>
}

export interface SyncResult {
  success: boolean
  usersCreated: number
  usersUpdated: number
  usersDeactivated: number
  groupsCreated: number
  groupsUpdated: number
  groupsDeleted: number
  errors: SyncError[]
  duration: number
  deltaLink?: string
}

export interface SyncError {
  type: 'user' | 'group'
  externalId: string
  operation: 'create' | 'update' | 'delete'
  message: string
}

/**
 * Directory Sync Service
 */
export class DirectorySyncService {
  private connection: DirectoryConnection | null = null

  /**
   * Initialize with a connection
   */
  async init(connectionId: string): Promise<void> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('directory_connections')
      .select('*')
      .eq('id', connectionId)
      .single()

    if (error || !data) {
      throw new Error('Directory connection not found')
    }

    this.connection = {
      id: data.id,
      organizationId: data.organization_id,
      provider: data.provider,
      name: data.name,
      config: data.config,
      status: data.status,
      lastSyncAt: data.last_sync_at,
      lastSyncStatus: data.last_sync_status,
      syncedUsers: data.synced_users,
      syncedGroups: data.synced_groups,
      errorMessage: data.error_message,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  }

  /**
   * Run a full sync
   */
  async runFullSync(): Promise<SyncResult> {
    if (!this.connection) {
      throw new Error('Connection not initialized')
    }

    const startTime = Date.now()
    const errors: SyncError[] = []
    let usersCreated = 0
    let usersUpdated = 0
    let usersDeactivated = 0
    let groupsCreated = 0
    let groupsUpdated = 0
    let groupsDeleted = 0

    try {
      // Update status
      await this.updateConnectionStatus('syncing')

      // Get provider client
      const client = this.getProviderClient()

      // Sync groups first (if enabled)
      if (this.connection.config.syncGroups) {
        const groupResult = await this.syncGroups(client)
        groupsCreated = groupResult.created
        groupsUpdated = groupResult.updated
        groupsDeleted = groupResult.deleted
        errors.push(...groupResult.errors)
      }

      // Sync users
      if (this.connection.config.syncUsers) {
        const userResult = await this.syncUsers(client)
        usersCreated = userResult.created
        usersUpdated = userResult.updated
        usersDeactivated = userResult.deactivated
        errors.push(...userResult.errors)
      }

      // Update connection status
      await this.updateSyncStatus({
        status: errors.length > 0 ? 'partial' : 'success',
        syncedUsers: usersCreated + usersUpdated,
        syncedGroups: groupsCreated + groupsUpdated,
        errorMessage: errors.length > 0 ? `${errors.length} errors during sync` : null
      })

      const duration = Date.now() - startTime

      // Log sync
      await this.logSync({
        type: 'full',
        result: {
          usersCreated,
          usersUpdated,
          usersDeactivated,
          groupsCreated,
          groupsUpdated,
          groupsDeleted,
          errors: errors.length,
          duration
        }
      })

      return {
        success: errors.length === 0,
        usersCreated,
        usersUpdated,
        usersDeactivated,
        groupsCreated,
        groupsUpdated,
        groupsDeleted,
        errors,
        duration
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sync failed'
      await this.updateSyncStatus({
        status: 'failure',
        errorMessage
      })

      throw err
    }
  }

  /**
   * Run an incremental (delta) sync
   */
  async runDeltaSync(): Promise<SyncResult> {
    if (!this.connection) {
      throw new Error('Connection not initialized')
    }

    const startTime = Date.now()
    const errors: SyncError[] = []

    try {
      // Get provider client
      const client = this.getProviderClient()

      // Get delta link from last sync
      const supabase = await createClient()
      const { data: lastSync } = await supabase
        .from('directory_sync_logs')
        .select('delta_link')
        .eq('connection_id', this.connection.id)
        .eq('type', 'incremental')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const deltaLink = lastSync?.delta_link

      // Fetch changes
      const changes = await client.fetchDeltaChanges(deltaLink)

      let usersCreated = 0
      let usersUpdated = 0
      let usersDeactivated = 0
      let groupsCreated = 0
      let groupsUpdated = 0
      let groupsDeleted = 0

      // Process user changes
      for (const change of changes.userChanges) {
        try {
          if (change.operation === 'create') {
            await this.createUser(change.user)
            usersCreated++
          } else if (change.operation === 'update') {
            await this.updateUser(change.user)
            usersUpdated++
          } else if (change.operation === 'delete') {
            await this.deactivateUser(change.externalId)
            usersDeactivated++
          }
        } catch (err) {
          errors.push({
            type: 'user',
            externalId: change.externalId,
            operation: change.operation,
            message: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }

      // Process group changes
      for (const change of changes.groupChanges) {
        try {
          if (change.operation === 'create') {
            await this.createGroup(change.group)
            groupsCreated++
          } else if (change.operation === 'update') {
            await this.updateGroup(change.group)
            groupsUpdated++
          } else if (change.operation === 'delete') {
            await this.deleteGroup(change.externalId)
            groupsDeleted++
          }
        } catch (err) {
          errors.push({
            type: 'group',
            externalId: change.externalId,
            operation: change.operation,
            message: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }

      const duration = Date.now() - startTime

      // Log sync with delta link
      await this.logSync({
        type: 'incremental',
        result: {
          usersCreated,
          usersUpdated,
          usersDeactivated,
          groupsCreated,
          groupsUpdated,
          groupsDeleted,
          errors: errors.length,
          duration
        },
        deltaLink: changes.newDeltaLink
      })

      return {
        success: errors.length === 0,
        usersCreated,
        usersUpdated,
        usersDeactivated,
        groupsCreated,
        groupsUpdated,
        groupsDeleted,
        errors,
        duration,
        deltaLink: changes.newDeltaLink
      }
    } catch (err) {
      throw err
    }
  }

  /**
   * Sync users from directory
   */
  private async syncUsers(client: DirectoryClient): Promise<{
    created: number
    updated: number
    deactivated: number
    errors: SyncError[]
  }> {
    const errors: SyncError[] = []
    let created = 0
    let updated = 0
    let deactivated = 0

    // Fetch all users from directory
    const directoryUsers = await client.fetchUsers()

    // Get existing users
    const supabase = await createClient()
    const { data: existingUsers } = await supabase
      .from('directory_user_mappings')
      .select('external_id, user_id')
      .eq('connection_id', this.connection!.id)

    const existingMap = new Map(
      (existingUsers || []).map(u => [u.external_id, u.user_id])
    )
    const processedIds = new Set<string>()

    // Process directory users
    for (const dirUser of directoryUsers) {
      processedIds.add(dirUser.externalId)

      try {
        if (existingMap.has(dirUser.externalId)) {
          // Update existing user
          await this.updateUser(dirUser)
          updated++
        } else if (this.connection!.config.autoProvision) {
          // Create new user
          await this.createUser(dirUser)
          created++
        }
      } catch (err) {
        errors.push({
          type: 'user',
          externalId: dirUser.externalId,
          operation: existingMap.has(dirUser.externalId) ? 'update' : 'create',
          message: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    // Handle removed users (if auto-deprovision is enabled)
    if (this.connection!.config.autoDeprovision) {
      for (const [externalId] of existingMap) {
        if (!processedIds.has(externalId)) {
          try {
            await this.deactivateUser(externalId)
            deactivated++
          } catch (err) {
            errors.push({
              type: 'user',
              externalId,
              operation: 'delete',
              message: err instanceof Error ? err.message : 'Unknown error'
            })
          }
        }
      }
    }

    return { created, updated, deactivated, errors }
  }

  /**
   * Sync groups from directory
   */
  private async syncGroups(client: DirectoryClient): Promise<{
    created: number
    updated: number
    deleted: number
    errors: SyncError[]
  }> {
    const errors: SyncError[] = []
    let created = 0
    let updated = 0
    let deleted = 0

    // Fetch all groups from directory
    const directoryGroups = await client.fetchGroups()

    // Get existing groups
    const supabase = await createClient()
    const { data: existingGroups } = await supabase
      .from('directory_group_mappings')
      .select('external_id, group_id')
      .eq('connection_id', this.connection!.id)

    const existingMap = new Map(
      (existingGroups || []).map(g => [g.external_id, g.group_id])
    )
    const processedIds = new Set<string>()

    // Process directory groups
    for (const dirGroup of directoryGroups) {
      processedIds.add(dirGroup.externalId)

      try {
        if (existingMap.has(dirGroup.externalId)) {
          await this.updateGroup(dirGroup)
          updated++
        } else {
          await this.createGroup(dirGroup)
          created++
        }
      } catch (err) {
        errors.push({
          type: 'group',
          externalId: dirGroup.externalId,
          operation: existingMap.has(dirGroup.externalId) ? 'update' : 'create',
          message: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    // Delete removed groups
    for (const [externalId] of existingMap) {
      if (!processedIds.has(externalId)) {
        try {
          await this.deleteGroup(externalId)
          deleted++
        } catch (err) {
          errors.push({
            type: 'group',
            externalId,
            operation: 'delete',
            message: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }
    }

    return { created, updated, deleted, errors }
  }

  /**
   * Create a user from directory
   */
  private async createUser(dirUser: DirectoryUser): Promise<string> {
    const supabase = await createClient()

    // Apply attribute mappings
    const mappedAttributes = await this.applyAttributeMappings(dirUser)

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: dirUser.email,
        name: dirUser.displayName || `${dirUser.firstName} ${dirUser.lastName}`.trim(),
        first_name: mappedAttributes.first_name || dirUser.firstName,
        last_name: mappedAttributes.last_name || dirUser.lastName,
        job_title: mappedAttributes.job_title || dirUser.jobTitle,
        department: mappedAttributes.department || dirUser.department,
        phone: mappedAttributes.phone || dirUser.phone,
        avatar_url: dirUser.avatar,
        organization_id: this.connection!.organizationId,
        role: this.connection!.config.defaultRole || 'member',
        is_active: dirUser.active,
        directory_synced: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) throw error

    // Create mapping
    await supabase.from('directory_user_mappings').insert({
      connection_id: this.connection!.id,
      external_id: dirUser.externalId,
      user_id: newUser.id,
      attributes: dirUser.attributes,
      created_at: new Date().toISOString()
    })

    // Sync group memberships
    await this.syncUserGroups(newUser.id, dirUser.groups)

    return newUser.id
  }

  /**
   * Update a user from directory
   */
  private async updateUser(dirUser: DirectoryUser): Promise<void> {
    const supabase = await createClient()

    // Get user mapping
    const { data: mapping } = await supabase
      .from('directory_user_mappings')
      .select('user_id')
      .eq('connection_id', this.connection!.id)
      .eq('external_id', dirUser.externalId)
      .single()

    if (!mapping) return

    // Apply attribute mappings
    const mappedAttributes = await this.applyAttributeMappings(dirUser)

    // Update user
    await supabase
      .from('users')
      .update({
        name: dirUser.displayName || `${dirUser.firstName} ${dirUser.lastName}`.trim(),
        first_name: mappedAttributes.first_name || dirUser.firstName,
        last_name: mappedAttributes.last_name || dirUser.lastName,
        job_title: mappedAttributes.job_title || dirUser.jobTitle,
        department: mappedAttributes.department || dirUser.department,
        phone: mappedAttributes.phone || dirUser.phone,
        avatar_url: dirUser.avatar,
        is_active: dirUser.active,
        updated_at: new Date().toISOString()
      })
      .eq('id', mapping.user_id)

    // Update mapping attributes
    await supabase
      .from('directory_user_mappings')
      .update({
        attributes: dirUser.attributes,
        updated_at: new Date().toISOString()
      })
      .eq('connection_id', this.connection!.id)
      .eq('external_id', dirUser.externalId)

    // Sync group memberships
    await this.syncUserGroups(mapping.user_id, dirUser.groups)
  }

  /**
   * Deactivate a user
   */
  private async deactivateUser(externalId: string): Promise<void> {
    const supabase = await createClient()

    // Get user mapping
    const { data: mapping } = await supabase
      .from('directory_user_mappings')
      .select('user_id')
      .eq('connection_id', this.connection!.id)
      .eq('external_id', externalId)
      .single()

    if (!mapping) return

    // Deactivate user
    await supabase
      .from('users')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', mapping.user_id)

    // Remove from all groups
    await supabase
      .from('scim_group_members')
      .delete()
      .eq('user_id', mapping.user_id)
  }

  /**
   * Create a group from directory
   */
  private async createGroup(dirGroup: DirectoryGroup): Promise<string> {
    const supabase = await createClient()

    // Create group
    const { data: newGroup, error } = await supabase
      .from('scim_groups')
      .insert({
        display_name: dirGroup.name,
        external_id: dirGroup.externalId,
        description: dirGroup.description,
        organization_id: this.connection!.organizationId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) throw error

    // Create mapping
    await supabase.from('directory_group_mappings').insert({
      connection_id: this.connection!.id,
      external_id: dirGroup.externalId,
      group_id: newGroup.id,
      attributes: dirGroup.attributes,
      created_at: new Date().toISOString()
    })

    return newGroup.id
  }

  /**
   * Update a group from directory
   */
  private async updateGroup(dirGroup: DirectoryGroup): Promise<void> {
    const supabase = await createClient()

    // Get group mapping
    const { data: mapping } = await supabase
      .from('directory_group_mappings')
      .select('group_id')
      .eq('connection_id', this.connection!.id)
      .eq('external_id', dirGroup.externalId)
      .single()

    if (!mapping) return

    // Update group
    await supabase
      .from('scim_groups')
      .update({
        display_name: dirGroup.name,
        description: dirGroup.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', mapping.group_id)

    // Update mapping
    await supabase
      .from('directory_group_mappings')
      .update({
        attributes: dirGroup.attributes,
        updated_at: new Date().toISOString()
      })
      .eq('connection_id', this.connection!.id)
      .eq('external_id', dirGroup.externalId)
  }

  /**
   * Delete a group
   */
  private async deleteGroup(externalId: string): Promise<void> {
    const supabase = await createClient()

    // Get group mapping
    const { data: mapping } = await supabase
      .from('directory_group_mappings')
      .select('group_id')
      .eq('connection_id', this.connection!.id)
      .eq('external_id', externalId)
      .single()

    if (!mapping) return

    // Delete group members
    await supabase
      .from('scim_group_members')
      .delete()
      .eq('group_id', mapping.group_id)

    // Delete group
    await supabase
      .from('scim_groups')
      .delete()
      .eq('id', mapping.group_id)

    // Delete mapping
    await supabase
      .from('directory_group_mappings')
      .delete()
      .eq('connection_id', this.connection!.id)
      .eq('external_id', externalId)
  }

  /**
   * Sync user's group memberships
   */
  private async syncUserGroups(userId: string, groupExternalIds: string[]): Promise<void> {
    const supabase = await createClient()

    // Get group mappings
    const { data: groupMappings } = await supabase
      .from('directory_group_mappings')
      .select('external_id, group_id')
      .eq('connection_id', this.connection!.id)
      .in('external_id', groupExternalIds)

    const groupIds = (groupMappings || []).map(m => m.group_id)

    // Remove existing memberships
    await supabase
      .from('scim_group_members')
      .delete()
      .eq('user_id', userId)

    // Add new memberships
    if (groupIds.length > 0) {
      await supabase.from('scim_group_members').insert(
        groupIds.map(groupId => ({
          group_id: groupId,
          user_id: userId,
          created_at: new Date().toISOString()
        }))
      )
    }
  }

  /**
   * Apply attribute mappings
   */
  private async applyAttributeMappings(
    dirUser: DirectoryUser
  ): Promise<Record<string, unknown>> {
    const supabase = await createClient()

    // Get attribute mappings
    const { data: mappings } = await supabase
      .from('directory_attribute_mappings')
      .select('*')
      .eq('connection_id', this.connection!.id)

    const result: Record<string, unknown> = {}

    for (const mapping of mappings || []) {
      let value = this.getNestedValue(dirUser, mapping.source_attribute)

      // Apply transform if defined
      if (mapping.transform_function && value !== undefined) {
        try {
          value = this.applyTransform(value, mapping.transform_function)
        } catch {
          // Keep original value on transform error
        }
      }

      if (value !== undefined) {
        result[mapping.target_attribute] = value
      }
    }

    return result
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.')
    let current: unknown = obj

    for (const part of parts) {
      if (current === null || current === undefined) return undefined
      current = (current as Record<string, unknown>)[part]
    }

    return current
  }

  /**
   * Apply transform function to value
   */
  private applyTransform(value: unknown, transform: string): unknown {
    switch (transform) {
      case 'lowercase':
        return String(value).toLowerCase()
      case 'uppercase':
        return String(value).toUpperCase()
      case 'trim':
        return String(value).trim()
      case 'first_name':
        return String(value).split(' ')[0]
      case 'last_name':
        return String(value).split(' ').slice(1).join(' ')
      default:
        return value
    }
  }

  /**
   * Get provider client
   */
  private getProviderClient(): DirectoryClient {
    switch (this.connection!.provider) {
      case 'azure_ad':
        return new AzureADClient(this.connection!.config)
      case 'google_workspace':
        return new GoogleWorkspaceClient(this.connection!.config)
      case 'okta':
        return new OktaClient(this.connection!.config)
      case 'onelogin':
        return new OneLoginClient(this.connection!.config)
      case 'ldap':
        return new LDAPClient(this.connection!.config)
      default:
        throw new Error(`Unsupported provider: ${this.connection!.provider}`)
    }
  }

  /**
   * Update connection status
   */
  private async updateConnectionStatus(status: string): Promise<void> {
    const supabase = await createClient()

    await supabase
      .from('directory_connections')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', this.connection!.id)
  }

  /**
   * Update sync status
   */
  private async updateSyncStatus(data: {
    status: 'success' | 'partial' | 'failure'
    syncedUsers?: number
    syncedGroups?: number
    errorMessage?: string | null
  }): Promise<void> {
    const supabase = await createClient()

    await supabase
      .from('directory_connections')
      .update({
        status: 'active',
        last_sync_at: new Date().toISOString(),
        last_sync_status: data.status,
        synced_users: data.syncedUsers,
        synced_groups: data.syncedGroups,
        error_message: data.errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', this.connection!.id)
  }

  /**
   * Log sync operation
   */
  private async logSync(data: {
    type: 'full' | 'incremental'
    result: Record<string, unknown>
    deltaLink?: string
  }): Promise<void> {
    const supabase = await createClient()

    await supabase.from('directory_sync_logs').insert({
      connection_id: this.connection!.id,
      type: data.type,
      result: data.result,
      delta_link: data.deltaLink,
      created_at: new Date().toISOString()
    })
  }
}

// ============================================================================
// PROVIDER CLIENTS
// ============================================================================

interface DirectoryClient {
  fetchUsers(): Promise<DirectoryUser[]>
  fetchGroups(): Promise<DirectoryGroup[]>
  fetchDeltaChanges(deltaLink?: string): Promise<{
    userChanges: Array<{
      operation: 'create' | 'update' | 'delete'
      externalId: string
      user?: DirectoryUser
    }>
    groupChanges: Array<{
      operation: 'create' | 'update' | 'delete'
      externalId: string
      group?: DirectoryGroup
    }>
    newDeltaLink: string
  }>
}

/**
 * Azure AD (Microsoft Graph) Client
 */
class AzureADClient implements DirectoryClient {
  private config: DirectoryConfig
  private accessToken: string | null = null

  constructor(config: DirectoryConfig) {
    this.config = config
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken

    const response = await fetch(
      `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId!,
          client_secret: this.config.clientSecret!,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials'
        })
      }
    )

    const data = await response.json()
    this.accessToken = data.access_token
    return this.accessToken
  }

  async fetchUsers(): Promise<DirectoryUser[]> {
    const token = await this.getAccessToken()
    const users: DirectoryUser[] = []
    let nextLink: string | null = 'https://graph.microsoft.com/v1.0/users?$select=id,displayName,givenName,surname,mail,userPrincipalName,jobTitle,department,mobilePhone,accountEnabled'

    while (nextLink) {
      const response = await fetch(nextLink, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await response.json()

      for (const user of data.value) {
        users.push({
          externalId: user.id,
          email: user.mail || user.userPrincipalName,
          firstName: user.givenName,
          lastName: user.surname,
          displayName: user.displayName,
          jobTitle: user.jobTitle,
          department: user.department,
          phone: user.mobilePhone,
          active: user.accountEnabled,
          groups: [],
          attributes: user
        })
      }

      nextLink = data['@odata.nextLink'] || null
    }

    // Fetch group memberships
    for (const user of users) {
      const groupResponse = await fetch(
        `https://graph.microsoft.com/v1.0/users/${user.externalId}/memberOf?$select=id,displayName`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const groupData = await groupResponse.json()
      user.groups = groupData.value
        .filter((g: { '@odata.type': string }) => g['@odata.type'] === '#microsoft.graph.group')
        .map((g: { id: string }) => g.id)
    }

    return users
  }

  async fetchGroups(): Promise<DirectoryGroup[]> {
    const token = await this.getAccessToken()
    const groups: DirectoryGroup[] = []
    let nextLink: string | null = 'https://graph.microsoft.com/v1.0/groups?$select=id,displayName,description'

    while (nextLink) {
      const response = await fetch(nextLink, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await response.json()

      for (const group of data.value) {
        groups.push({
          externalId: group.id,
          name: group.displayName,
          description: group.description,
          members: [],
          attributes: group
        })
      }

      nextLink = data['@odata.nextLink'] || null
    }

    return groups
  }

  async fetchDeltaChanges(deltaLink?: string): Promise<{
    userChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; user?: DirectoryUser }>
    groupChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; group?: DirectoryGroup }>
    newDeltaLink: string
  }> {
    const token = await this.getAccessToken()
    const url = deltaLink || 'https://graph.microsoft.com/v1.0/users/delta'

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })

    const data = await response.json()

    const userChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; user?: DirectoryUser }> = []

    for (const user of data.value) {
      if (user['@removed']) {
        userChanges.push({
          operation: 'delete',
          externalId: user.id
        })
      } else {
        userChanges.push({
          operation: 'update', // Could be create or update
          externalId: user.id,
          user: {
            externalId: user.id,
            email: user.mail || user.userPrincipalName,
            firstName: user.givenName,
            lastName: user.surname,
            displayName: user.displayName,
            jobTitle: user.jobTitle,
            department: user.department,
            phone: user.mobilePhone,
            active: user.accountEnabled,
            groups: [],
            attributes: user
          }
        })
      }
    }

    return {
      userChanges,
      groupChanges: [],
      newDeltaLink: data['@odata.deltaLink'] || data['@odata.nextLink']
    }
  }
}

/**
 * Google Workspace (Admin SDK) Client
 */
class GoogleWorkspaceClient implements DirectoryClient {
  private config: DirectoryConfig

  constructor(config: DirectoryConfig) {
    this.config = config
  }

  async fetchUsers(): Promise<DirectoryUser[]> {
    // Implementation uses Google Admin SDK
    const { google } = await import('googleapis')

    const auth = new google.auth.JWT({
      email: JSON.parse(this.config.serviceAccountKey!).client_email,
      key: JSON.parse(this.config.serviceAccountKey!).private_key,
      scopes: ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
      subject: this.config.adminEmail
    })

    const admin = google.admin({ version: 'directory_v1', auth })
    const users: DirectoryUser[] = []
    let pageToken: string | undefined

    do {
      const response = await admin.users.list({
        domain: this.config.domain,
        maxResults: 100,
        pageToken
      })

      for (const user of response.data.users || []) {
        users.push({
          externalId: user.id!,
          email: user.primaryEmail!,
          firstName: user.name?.givenName,
          lastName: user.name?.familyName,
          displayName: user.name?.fullName,
          phone: user.phones?.[0]?.value,
          active: !user.suspended,
          groups: [],
          attributes: user as unknown as Record<string, unknown>
        })
      }

      pageToken = response.data.nextPageToken || undefined
    } while (pageToken)

    return users
  }

  async fetchGroups(): Promise<DirectoryGroup[]> {
    const { google } = await import('googleapis')

    const auth = new google.auth.JWT({
      email: JSON.parse(this.config.serviceAccountKey!).client_email,
      key: JSON.parse(this.config.serviceAccountKey!).private_key,
      scopes: ['https://www.googleapis.com/auth/admin.directory.group.readonly'],
      subject: this.config.adminEmail
    })

    const admin = google.admin({ version: 'directory_v1', auth })
    const groups: DirectoryGroup[] = []
    let pageToken: string | undefined

    do {
      const response = await admin.groups.list({
        domain: this.config.domain,
        maxResults: 100,
        pageToken
      })

      for (const group of response.data.groups || []) {
        groups.push({
          externalId: group.id!,
          name: group.name!,
          description: group.description,
          members: [],
          attributes: group as unknown as Record<string, unknown>
        })
      }

      pageToken = response.data.nextPageToken || undefined
    } while (pageToken)

    return groups
  }

  async fetchDeltaChanges(): Promise<{
    userChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; user?: DirectoryUser }>
    groupChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; group?: DirectoryGroup }>
    newDeltaLink: string
  }> {
    // Google doesn't have native delta API, do full sync
    const users = await this.fetchUsers()
    return {
      userChanges: users.map(user => ({
        operation: 'update' as const,
        externalId: user.externalId,
        user
      })),
      groupChanges: [],
      newDeltaLink: ''
    }
  }
}

/**
 * Okta Client
 */
class OktaClient implements DirectoryClient {
  private config: DirectoryConfig

  constructor(config: DirectoryConfig) {
    this.config = config
  }

  async fetchUsers(): Promise<DirectoryUser[]> {
    const users: DirectoryUser[] = []
    let after: string | null = null

    do {
      const url = new URL(`https://${this.config.oktaDomain}/api/v1/users`)
      url.searchParams.set('limit', '200')
      if (after) url.searchParams.set('after', after)

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `SSWS ${this.config.apiToken}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      for (const user of data) {
        users.push({
          externalId: user.id,
          email: user.profile.email,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          displayName: `${user.profile.firstName} ${user.profile.lastName}`,
          jobTitle: user.profile.title,
          department: user.profile.department,
          phone: user.profile.mobilePhone,
          active: user.status === 'ACTIVE',
          groups: [],
          attributes: user.profile
        })
      }

      // Get next page
      const linkHeader = response.headers.get('Link')
      if (linkHeader) {
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
        if (nextMatch) {
          const nextUrl = new URL(nextMatch[1])
          after = nextUrl.searchParams.get('after')
        } else {
          after = null
        }
      } else {
        after = null
      }
    } while (after)

    // Fetch group memberships
    for (const user of users) {
      const groupResponse = await fetch(
        `https://${this.config.oktaDomain}/api/v1/users/${user.externalId}/groups`,
        {
          headers: {
            'Authorization': `SSWS ${this.config.apiToken}`,
            'Accept': 'application/json'
          }
        }
      )
      const groupData = await groupResponse.json()
      user.groups = groupData.map((g: { id: string }) => g.id)
    }

    return users
  }

  async fetchGroups(): Promise<DirectoryGroup[]> {
    const groups: DirectoryGroup[] = []
    let after: string | null = null

    do {
      const url = new URL(`https://${this.config.oktaDomain}/api/v1/groups`)
      url.searchParams.set('limit', '200')
      if (after) url.searchParams.set('after', after)

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `SSWS ${this.config.apiToken}`,
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      for (const group of data) {
        groups.push({
          externalId: group.id,
          name: group.profile.name,
          description: group.profile.description,
          members: [],
          attributes: group.profile
        })
      }

      // Get next page
      const linkHeader = response.headers.get('Link')
      if (linkHeader) {
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
        if (nextMatch) {
          const nextUrl = new URL(nextMatch[1])
          after = nextUrl.searchParams.get('after')
        } else {
          after = null
        }
      } else {
        after = null
      }
    } while (after)

    return groups
  }

  async fetchDeltaChanges(): Promise<{
    userChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; user?: DirectoryUser }>
    groupChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; group?: DirectoryGroup }>
    newDeltaLink: string
  }> {
    // Use Okta System Log for delta changes
    const users = await this.fetchUsers()
    return {
      userChanges: users.map(user => ({
        operation: 'update' as const,
        externalId: user.externalId,
        user
      })),
      groupChanges: [],
      newDeltaLink: ''
    }
  }
}

/**
 * OneLogin Client
 */
class OneLoginClient implements DirectoryClient {
  private config: DirectoryConfig

  constructor(config: DirectoryConfig) {
    this.config = config
  }

  async fetchUsers(): Promise<DirectoryUser[]> {
    // Implement OneLogin API
    return []
  }

  async fetchGroups(): Promise<DirectoryGroup[]> {
    return []
  }

  async fetchDeltaChanges(): Promise<{
    userChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; user?: DirectoryUser }>
    groupChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; group?: DirectoryGroup }>
    newDeltaLink: string
  }> {
    return { userChanges: [], groupChanges: [], newDeltaLink: '' }
  }
}

/**
 * LDAP Client
 */
class LDAPClient implements DirectoryClient {
  private config: DirectoryConfig

  constructor(config: DirectoryConfig) {
    this.config = config
  }

  async fetchUsers(): Promise<DirectoryUser[]> {
    // Implement LDAP search
    return []
  }

  async fetchGroups(): Promise<DirectoryGroup[]> {
    return []
  }

  async fetchDeltaChanges(): Promise<{
    userChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; user?: DirectoryUser }>
    groupChanges: Array<{ operation: 'create' | 'update' | 'delete'; externalId: string; group?: DirectoryGroup }>
    newDeltaLink: string
  }> {
    return { userChanges: [], groupChanges: [], newDeltaLink: '' }
  }
}

// Export singleton and convenience functions
export const directorySyncService = new DirectorySyncService()

export async function runDirectorySync(connectionId: string, type: 'full' | 'incremental' = 'full'): Promise<SyncResult> {
  const service = new DirectorySyncService()
  await service.init(connectionId)
  return type === 'full' ? service.runFullSync() : service.runDeltaSync()
}

export async function createDirectoryConnection(data: {
  organizationId: string
  provider: DirectoryProvider
  name: string
  config: DirectoryConfig
}): Promise<string> {
  const supabase = await createClient()

  const { data: connection, error } = await supabase
    .from('directory_connections')
    .insert({
      organization_id: data.organizationId,
      provider: data.provider,
      name: data.name,
      config: data.config,
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single()

  if (error) throw error
  return connection.id
}

export async function listDirectoryConnections(organizationId: string): Promise<DirectoryConnection[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('directory_connections')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data || []).map(d => ({
    id: d.id,
    organizationId: d.organization_id,
    provider: d.provider,
    name: d.name,
    config: d.config,
    status: d.status,
    lastSyncAt: d.last_sync_at,
    lastSyncStatus: d.last_sync_status,
    syncedUsers: d.synced_users,
    syncedGroups: d.synced_groups,
    errorMessage: d.error_message,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }))
}

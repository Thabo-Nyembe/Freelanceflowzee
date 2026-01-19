/**
 * Fine-Grained Authorization Service (Zanzibar-style)
 *
 * Implements Google Zanzibar-style relationship-based access control
 * Similar to: Ory Keto, SpiceDB, AuthZed, OpenFGA
 *
 * Features:
 * - Relationship-based permissions (tuples)
 * - Permission inheritance through relation traversal
 * - Namespace/type definitions
 * - Permission checks with caching
 * - Bulk permission operations
 * - Audit trail
 *
 * @module lib/auth/authorization-service
 */

import { createClient } from '@/lib/supabase/server'

// Types
export interface PermissionTuple {
  id: string
  namespace: string
  object_id: string
  relation: string
  subject_namespace: string
  subject_id: string
  subject_relation?: string // For userset references
  created_at: string
  created_by?: string
}

export interface PermissionNamespace {
  id: string
  name: string
  description?: string
  relations: RelationDefinition[]
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface RelationDefinition {
  name: string
  description?: string
  direct_types?: string[] // Allowed subject namespaces
  computed?: ComputedUserset // For computed relations
  union?: RelationReference[] // Union of relations
  intersection?: RelationReference[] // Intersection of relations
  exclusion?: {
    base: RelationReference
    subtract: RelationReference
  }
}

export interface RelationReference {
  relation: string
  namespace?: string // For cross-namespace references
}

export interface ComputedUserset {
  // Reference to another relation
  computed_userset?: {
    relation: string
  }
  // Tuple to userset (e.g., parent->owner)
  tuple_to_userset?: {
    tupleset: {
      relation: string
    }
    computed_userset: {
      relation: string
    }
  }
}

export interface CheckRequest {
  namespace: string
  object_id: string
  relation: string
  subject_namespace: string
  subject_id: string
  subject_relation?: string
  context?: Record<string, unknown>
}

export interface CheckResult {
  allowed: boolean
  cached: boolean
  debug?: {
    path: string[]
    duration_ms: number
  }
}

export interface ExpandResult {
  subject_namespace: string
  subject_id: string
  subject_relation?: string
  children?: ExpandResult[]
}

// Built-in namespace definitions
const BUILTIN_NAMESPACES: PermissionNamespace[] = [
  {
    id: 'user',
    name: 'user',
    description: 'User entities',
    relations: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'organization',
    name: 'organization',
    description: 'Organization entities',
    relations: [
      { name: 'owner', direct_types: ['user'] },
      { name: 'admin', direct_types: ['user'] },
      { name: 'member', direct_types: ['user'] },
      {
        name: 'can_manage',
        union: [
          { relation: 'owner' },
          { relation: 'admin' }
        ]
      },
      {
        name: 'can_view',
        union: [
          { relation: 'can_manage' },
          { relation: 'member' }
        ]
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'project',
    name: 'project',
    description: 'Project entities',
    relations: [
      { name: 'organization', direct_types: ['organization'] },
      { name: 'owner', direct_types: ['user'] },
      { name: 'editor', direct_types: ['user'] },
      { name: 'viewer', direct_types: ['user'] },
      {
        name: 'can_delete',
        union: [
          { relation: 'owner' },
          {
            computed_userset: {
              relation: 'organization'
            }
          }
        ]
      },
      {
        name: 'can_edit',
        union: [
          { relation: 'can_delete' },
          { relation: 'editor' }
        ]
      },
      {
        name: 'can_view',
        union: [
          { relation: 'can_edit' },
          { relation: 'viewer' },
          {
            computed_userset: {
              relation: 'organization'
            }
          }
        ]
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'document',
    name: 'document',
    description: 'Document entities',
    relations: [
      { name: 'project', direct_types: ['project'] },
      { name: 'owner', direct_types: ['user'] },
      { name: 'editor', direct_types: ['user'] },
      { name: 'viewer', direct_types: ['user'] },
      { name: 'commenter', direct_types: ['user'] },
      {
        name: 'can_delete',
        union: [{ relation: 'owner' }]
      },
      {
        name: 'can_edit',
        union: [
          { relation: 'can_delete' },
          { relation: 'editor' }
        ]
      },
      {
        name: 'can_comment',
        union: [
          { relation: 'can_edit' },
          { relation: 'commenter' }
        ]
      },
      {
        name: 'can_view',
        union: [
          { relation: 'can_comment' },
          { relation: 'viewer' }
        ]
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'invoice',
    name: 'invoice',
    description: 'Invoice entities',
    relations: [
      { name: 'organization', direct_types: ['organization'] },
      { name: 'owner', direct_types: ['user'] },
      { name: 'viewer', direct_types: ['user'] },
      {
        name: 'can_edit',
        union: [{ relation: 'owner' }]
      },
      {
        name: 'can_view',
        union: [
          { relation: 'can_edit' },
          { relation: 'viewer' }
        ]
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

// Permission cache (in-memory with TTL)
interface CacheEntry {
  result: boolean
  expires_at: number
}

const permissionCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60000 // 1 minute

/**
 * Authorization Service Class
 */
export class AuthorizationService {
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null
  private namespaces: Map<string, PermissionNamespace> = new Map()

  constructor() {
    // Load built-in namespaces
    BUILTIN_NAMESPACES.forEach(ns => this.namespaces.set(ns.name, ns))
  }

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
  // Permission Checks
  // ============================================================================

  /**
   * Check if a subject has a relation to an object
   */
  async check(request: CheckRequest): Promise<CheckResult> {
    const startTime = Date.now()
    const path: string[] = []

    // Check cache first
    const cacheKey = this.getCacheKey(request)
    const cached = this.getFromCache(cacheKey)
    if (cached !== null) {
      return {
        allowed: cached,
        cached: true,
        debug: {
          path: ['cache_hit'],
          duration_ms: Date.now() - startTime
        }
      }
    }

    try {
      const allowed = await this.checkPermission(request, path, new Set())

      // Cache result
      this.setInCache(cacheKey, allowed)

      return {
        allowed,
        cached: false,
        debug: {
          path,
          duration_ms: Date.now() - startTime
        }
      }
    } catch (error) {
      console.error('Permission check error:', error)
      return {
        allowed: false,
        cached: false,
        debug: {
          path: [...path, 'error'],
          duration_ms: Date.now() - startTime
        }
      }
    }
  }

  /**
   * Internal permission check with recursion detection
   */
  private async checkPermission(
    request: CheckRequest,
    path: string[],
    visited: Set<string>
  ): Promise<boolean> {
    const key = `${request.namespace}:${request.object_id}#${request.relation}@${request.subject_namespace}:${request.subject_id}`

    // Prevent infinite recursion
    if (visited.has(key)) {
      return false
    }
    visited.add(key)

    path.push(key)

    // Get namespace definition
    const namespace = await this.getNamespace(request.namespace)
    if (!namespace) {
      return false
    }

    // Find relation definition
    const relationDef = namespace.relations.find(r => r.name === request.relation)

    // 1. Check direct tuples
    const directMatch = await this.checkDirectTuple(request)
    if (directMatch) {
      return true
    }

    // 2. If no relation definition, only direct tuples count
    if (!relationDef) {
      return false
    }

    // 3. Check computed relations (union, intersection, etc.)
    if (relationDef.union) {
      for (const ref of relationDef.union) {
        const refRequest = this.resolveRelationReference(request, ref)
        if (await this.checkPermission(refRequest, path, visited)) {
          return true
        }
      }
    }

    if (relationDef.intersection) {
      let allMatch = true
      for (const ref of relationDef.intersection) {
        const refRequest = this.resolveRelationReference(request, ref)
        if (!(await this.checkPermission(refRequest, path, visited))) {
          allMatch = false
          break
        }
      }
      if (allMatch && relationDef.intersection.length > 0) {
        return true
      }
    }

    if (relationDef.exclusion) {
      const baseRequest = this.resolveRelationReference(request, relationDef.exclusion.base)
      const subtractRequest = this.resolveRelationReference(request, relationDef.exclusion.subtract)

      const baseAllowed = await this.checkPermission(baseRequest, path, visited)
      const subtractAllowed = await this.checkPermission(subtractRequest, path, visited)

      if (baseAllowed && !subtractAllowed) {
        return true
      }
    }

    // 4. Check computed userset (tuple_to_userset)
    if (relationDef.computed?.tuple_to_userset) {
      const { tupleset, computed_userset } = relationDef.computed.tuple_to_userset

      // Get intermediate objects
      const intermediates = await this.getRelatedObjects(
        request.namespace,
        request.object_id,
        tupleset.relation
      )

      for (const intermediate of intermediates) {
        const newRequest: CheckRequest = {
          namespace: intermediate.subject_namespace,
          object_id: intermediate.subject_id,
          relation: computed_userset.relation,
          subject_namespace: request.subject_namespace,
          subject_id: request.subject_id,
          subject_relation: request.subject_relation
        }

        if (await this.checkPermission(newRequest, path, visited)) {
          return true
        }
      }
    }

    // 5. Check group memberships (subject_relation)
    const groupMemberships = await this.getSubjectGroupMemberships(request)
    for (const membership of groupMemberships) {
      const groupRequest: CheckRequest = {
        namespace: request.namespace,
        object_id: request.object_id,
        relation: request.relation,
        subject_namespace: membership.namespace,
        subject_id: membership.object_id,
        subject_relation: membership.relation
      }

      if (await this.checkPermission(groupRequest, path, visited)) {
        return true
      }
    }

    return false
  }

  /**
   * Check for direct tuple match
   */
  private async checkDirectTuple(request: CheckRequest): Promise<boolean> {
    const supabase = await this.getSupabase()

    let query = supabase
      .from('permission_tuples')
      .select('id')
      .eq('namespace', request.namespace)
      .eq('object_id', request.object_id)
      .eq('relation', request.relation)
      .eq('subject_namespace', request.subject_namespace)
      .eq('subject_id', request.subject_id)

    if (request.subject_relation) {
      query = query.eq('subject_relation', request.subject_relation)
    } else {
      query = query.is('subject_relation', null)
    }

    const { data } = await query.limit(1)

    return data !== null && data.length > 0
  }

  /**
   * Get objects related through a specific relation
   */
  private async getRelatedObjects(
    namespace: string,
    objectId: string,
    relation: string
  ): Promise<Array<{ subject_namespace: string; subject_id: string; subject_relation?: string }>> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('permission_tuples')
      .select('subject_namespace, subject_id, subject_relation')
      .eq('namespace', namespace)
      .eq('object_id', objectId)
      .eq('relation', relation)

    return data || []
  }

  /**
   * Get groups/sets the subject is a member of
   */
  private async getSubjectGroupMemberships(
    request: CheckRequest
  ): Promise<Array<{ namespace: string; object_id: string; relation: string }>> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('permission_tuples')
      .select('namespace, object_id, relation')
      .eq('subject_namespace', request.subject_namespace)
      .eq('subject_id', request.subject_id)
      .is('subject_relation', null)

    return data || []
  }

  /**
   * Resolve relation reference to a check request
   */
  private resolveRelationReference(
    originalRequest: CheckRequest,
    ref: RelationReference
  ): CheckRequest {
    return {
      namespace: ref.namespace || originalRequest.namespace,
      object_id: originalRequest.object_id,
      relation: ref.relation,
      subject_namespace: originalRequest.subject_namespace,
      subject_id: originalRequest.subject_id,
      subject_relation: originalRequest.subject_relation
    }
  }

  // ============================================================================
  // Tuple Management
  // ============================================================================

  /**
   * Write (create) a permission tuple
   */
  async writeTuple(tuple: Omit<PermissionTuple, 'id' | 'created_at'>): Promise<PermissionTuple> {
    const supabase = await this.getSupabase()

    // Validate namespace and relation
    const namespace = await this.getNamespace(tuple.namespace)
    if (!namespace) {
      throw new Error(`Unknown namespace: ${tuple.namespace}`)
    }

    // Check if tuple already exists
    const existing = await this.checkDirectTuple({
      namespace: tuple.namespace,
      object_id: tuple.object_id,
      relation: tuple.relation,
      subject_namespace: tuple.subject_namespace,
      subject_id: tuple.subject_id,
      subject_relation: tuple.subject_relation
    })

    if (existing) {
      throw new Error('Permission tuple already exists')
    }

    const { data, error } = await supabase
      .from('permission_tuples')
      .insert(tuple)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to write tuple: ${error.message}`)
    }

    // Invalidate related cache entries
    this.invalidateCache(tuple.namespace, tuple.object_id)

    // Log audit event
    await this.logAuditEvent('tuple_created', data)

    return data
  }

  /**
   * Delete a permission tuple
   */
  async deleteTuple(
    namespace: string,
    objectId: string,
    relation: string,
    subjectNamespace: string,
    subjectId: string,
    subjectRelation?: string
  ): Promise<boolean> {
    const supabase = await this.getSupabase()

    let query = supabase
      .from('permission_tuples')
      .delete()
      .eq('namespace', namespace)
      .eq('object_id', objectId)
      .eq('relation', relation)
      .eq('subject_namespace', subjectNamespace)
      .eq('subject_id', subjectId)

    if (subjectRelation) {
      query = query.eq('subject_relation', subjectRelation)
    } else {
      query = query.is('subject_relation', null)
    }

    const { error } = await query

    if (!error) {
      // Invalidate cache
      this.invalidateCache(namespace, objectId)

      // Log audit event
      await this.logAuditEvent('tuple_deleted', {
        namespace,
        object_id: objectId,
        relation,
        subject_namespace: subjectNamespace,
        subject_id: subjectId
      })
    }

    return !error
  }

  /**
   * List tuples for an object
   */
  async listTuples(
    namespace: string,
    objectId: string,
    relation?: string
  ): Promise<PermissionTuple[]> {
    const supabase = await this.getSupabase()

    let query = supabase
      .from('permission_tuples')
      .select('*')
      .eq('namespace', namespace)
      .eq('object_id', objectId)

    if (relation) {
      query = query.eq('relation', relation)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list tuples: ${error.message}`)
    }

    return data || []
  }

  /**
   * List all objects a subject has access to
   */
  async listSubjectAccess(
    subjectNamespace: string,
    subjectId: string,
    relation?: string,
    objectNamespace?: string
  ): Promise<Array<{
    namespace: string
    object_id: string
    relation: string
  }>> {
    const supabase = await this.getSupabase()

    let query = supabase
      .from('permission_tuples')
      .select('namespace, object_id, relation')
      .eq('subject_namespace', subjectNamespace)
      .eq('subject_id', subjectId)

    if (relation) {
      query = query.eq('relation', relation)
    }

    if (objectNamespace) {
      query = query.eq('namespace', objectNamespace)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list subject access: ${error.message}`)
    }

    return data || []
  }

  // ============================================================================
  // Namespace Management
  // ============================================================================

  /**
   * Get namespace definition
   */
  async getNamespace(name: string): Promise<PermissionNamespace | null> {
    // Check in-memory first
    if (this.namespaces.has(name)) {
      return this.namespaces.get(name)!
    }

    // Check database
    const supabase = await this.getSupabase()
    const { data } = await supabase
      .from('permission_namespaces')
      .select('*')
      .eq('name', name)
      .single()

    if (data) {
      this.namespaces.set(name, data)
    }

    return data
  }

  /**
   * Create or update namespace
   */
  async upsertNamespace(namespace: Omit<PermissionNamespace, 'id' | 'created_at' | 'updated_at'>): Promise<PermissionNamespace> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('permission_namespaces')
      .upsert({
        name: namespace.name,
        description: namespace.description,
        relations: namespace.relations,
        metadata: namespace.metadata,
        updated_at: new Date().toISOString()
      }, { onConflict: 'name' })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upsert namespace: ${error.message}`)
    }

    // Update in-memory cache
    this.namespaces.set(data.name, data)

    return data
  }

  /**
   * List all namespaces
   */
  async listNamespaces(): Promise<PermissionNamespace[]> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('permission_namespaces')
      .select('*')
      .order('name')

    // Combine with built-in namespaces
    const dbNamespaces = data || []
    const builtInNames = new Set(BUILTIN_NAMESPACES.map(ns => ns.name))

    return [
      ...BUILTIN_NAMESPACES,
      ...dbNamespaces.filter(ns => !builtInNames.has(ns.name))
    ]
  }

  // ============================================================================
  // Expand/List Operations
  // ============================================================================

  /**
   * Expand a userset to list all subjects
   */
  async expand(
    namespace: string,
    objectId: string,
    relation: string,
    maxDepth: number = 10
  ): Promise<ExpandResult[]> {
    return this.expandInternal(namespace, objectId, relation, 0, maxDepth, new Set())
  }

  private async expandInternal(
    namespace: string,
    objectId: string,
    relation: string,
    depth: number,
    maxDepth: number,
    visited: Set<string>
  ): Promise<ExpandResult[]> {
    const key = `${namespace}:${objectId}#${relation}`
    if (depth >= maxDepth || visited.has(key)) {
      return []
    }
    visited.add(key)

    const results: ExpandResult[] = []

    // Get direct tuples
    const tuples = await this.listTuples(namespace, objectId, relation)

    for (const tuple of tuples) {
      const result: ExpandResult = {
        subject_namespace: tuple.subject_namespace,
        subject_id: tuple.subject_id,
        subject_relation: tuple.subject_relation
      }

      // Recursively expand usersets
      if (tuple.subject_relation) {
        result.children = await this.expandInternal(
          tuple.subject_namespace,
          tuple.subject_id,
          tuple.subject_relation,
          depth + 1,
          maxDepth,
          visited
        )
      }

      results.push(result)
    }

    // Check for computed relations
    const namespaceDef = await this.getNamespace(namespace)
    const relationDef = namespaceDef?.relations.find(r => r.name === relation)

    if (relationDef?.union) {
      for (const ref of relationDef.union) {
        const refResults = await this.expandInternal(
          ref.namespace || namespace,
          objectId,
          ref.relation,
          depth + 1,
          maxDepth,
          visited
        )
        results.push(...refResults)
      }
    }

    return results
  }

  // ============================================================================
  // Caching
  // ============================================================================

  private getCacheKey(request: CheckRequest): string {
    return `${request.namespace}:${request.object_id}#${request.relation}@${request.subject_namespace}:${request.subject_id}${request.subject_relation ? '#' + request.subject_relation : ''}`
  }

  private getFromCache(key: string): boolean | null {
    const entry = permissionCache.get(key)
    if (entry && entry.expires_at > Date.now()) {
      return entry.result
    }
    permissionCache.delete(key)
    return null
  }

  private setInCache(key: string, result: boolean): void {
    permissionCache.set(key, {
      result,
      expires_at: Date.now() + CACHE_TTL_MS
    })
  }

  private invalidateCache(namespace: string, objectId: string): void {
    const prefix = `${namespace}:${objectId}`
    for (const key of permissionCache.keys()) {
      if (key.startsWith(prefix)) {
        permissionCache.delete(key)
      }
    }
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    permissionCache.clear()
  }

  // ============================================================================
  // Audit Logging
  // ============================================================================

  private async logAuditEvent(
    eventType: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const supabase = await this.getSupabase()

    await supabase.from('permission_audit_log').insert({
      event_type: eventType,
      data,
      created_at: new Date().toISOString()
    })
  }
}

// Export singleton instance
export const authorizationService = new AuthorizationService()

// Convenience functions for common checks
export async function canView(
  subjectId: string,
  objectNamespace: string,
  objectId: string
): Promise<boolean> {
  const result = await authorizationService.check({
    namespace: objectNamespace,
    object_id: objectId,
    relation: 'can_view',
    subject_namespace: 'user',
    subject_id: subjectId
  })
  return result.allowed
}

export async function canEdit(
  subjectId: string,
  objectNamespace: string,
  objectId: string
): Promise<boolean> {
  const result = await authorizationService.check({
    namespace: objectNamespace,
    object_id: objectId,
    relation: 'can_edit',
    subject_namespace: 'user',
    subject_id: subjectId
  })
  return result.allowed
}

export async function canDelete(
  subjectId: string,
  objectNamespace: string,
  objectId: string
): Promise<boolean> {
  const result = await authorizationService.check({
    namespace: objectNamespace,
    object_id: objectId,
    relation: 'can_delete',
    subject_namespace: 'user',
    subject_id: subjectId
  })
  return result.allowed
}

export async function grantPermission(
  objectNamespace: string,
  objectId: string,
  relation: string,
  subjectId: string,
  grantedBy?: string
): Promise<void> {
  await authorizationService.writeTuple({
    namespace: objectNamespace,
    object_id: objectId,
    relation,
    subject_namespace: 'user',
    subject_id: subjectId,
    created_by: grantedBy
  })
}

export async function revokePermission(
  objectNamespace: string,
  objectId: string,
  relation: string,
  subjectId: string
): Promise<void> {
  await authorizationService.deleteTuple(
    objectNamespace,
    objectId,
    relation,
    'user',
    subjectId
  )
}

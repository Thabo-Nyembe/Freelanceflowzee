import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'
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

const logger = createFeatureLogger('collaboration-documents')

// Types
interface DocumentVersion {
  id: string
  documentId: string
  version: number
  content: any
  delta?: any
  checksum: string
  createdBy: string
  createdAt: string
}

interface DocumentState {
  documentId: string
  content: any
  version: number
  lastModified: string
  lastModifiedBy: string
  collaborators: string[]
}

// GET - Fetch document data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const version = searchParams.get('version')
    const includeHistory = searchParams.get('includeHistory') === 'true'

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Get document
    const { data: document, error } = await supabase
      .from('collaboration_documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (error || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check access
    const hasAccess = await checkDocumentAccess(supabase, documentId, user.id)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get specific version if requested
    if (version) {
      const { data: versionData } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .eq('version', parseInt(version))
        .single()

      return NextResponse.json({
        document,
        version: versionData
      })
    }

    // Get version history if requested
    let history = null
    if (includeHistory) {
      const { data: versions } = await supabase
        .from('document_versions')
        .select('id, version, created_by, created_at, checksum')
        .eq('document_id', documentId)
        .order('version', { ascending: false })
        .limit(50)

      history = versions
    }

    return NextResponse.json({
      document,
      history
    })
  } catch (error) {
    logger.error('Document fetch error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

// POST - Document actions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'create': {
        const { title, type, content, sessionId } = params

        const documentId = nanoid(16)
        const checksum = generateChecksum(JSON.stringify(content || {}))

        // Create document
        const { data: document, error } = await supabase
          .from('collaboration_documents')
          .insert({
            id: documentId,
            title: title || 'Untitled',
            type: type || 'document',
            content: content || {},
            current_version: 1,
            owner_id: user.id,
            checksum,
            last_modified_by: user.id
          })
          .select()
          .single()

        if (error) throw error

        // Create initial version
        await supabase.from('document_versions').insert({
          document_id: documentId,
          version: 1,
          content: content || {},
          checksum,
          created_by: user.id
        })

        // Associate with session if provided
        if (sessionId) {
          await supabase
            .from('collaboration_sessions')
            .update({ document_id: documentId })
            .eq('id', sessionId)
        }

        return NextResponse.json({ success: true, document })
      }

      case 'update': {
        const { documentId, content, baseVersion, delta } = params

        // Check access
        const hasAccess = await checkDocumentAccess(supabase, documentId, user.id, 'edit')
        if (!hasAccess) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // Get current document state
        const { data: doc } = await supabase
          .from('collaboration_documents')
          .select('current_version, content')
          .eq('id', documentId)
          .single()

        if (!doc) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        // Check for conflicts (optimistic concurrency)
        if (baseVersion && baseVersion !== doc.current_version) {
          // Version mismatch - need to merge
          return NextResponse.json({
            success: false,
            conflict: true,
            serverVersion: doc.current_version,
            serverContent: doc.content,
            message: 'Document has been modified. Please merge changes.'
          }, { status: 409 })
        }

        const newVersion = doc.current_version + 1
        const checksum = generateChecksum(JSON.stringify(content))

        // Update document
        const { error: updateError } = await supabase
          .from('collaboration_documents')
          .update({
            content,
            current_version: newVersion,
            checksum,
            last_modified_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId)

        if (updateError) throw updateError

        // Create version entry
        await supabase.from('document_versions').insert({
          document_id: documentId,
          version: newVersion,
          content,
          delta, // Store operation delta for CRDT
          checksum,
          created_by: user.id
        })

        // Broadcast update to other collaborators
        await supabase.from('collaboration_events').insert({
          document_id: documentId,
          event_type: 'document_updated',
          user_id: user.id,
          data: {
            version: newVersion,
            delta,
            checksum
          }
        })

        return NextResponse.json({
          success: true,
          version: newVersion,
          checksum
        })
      }

      case 'apply-operation': {
        // For CRDT-based real-time sync
        const { documentId, operation, clientId, clock } = params

        // Store operation for other clients
        await supabase.from('document_operations').insert({
          document_id: documentId,
          operation,
          client_id: clientId,
          user_id: user.id,
          logical_clock: clock
        })

        // Broadcast operation
        await supabase.from('collaboration_events').insert({
          document_id: documentId,
          event_type: 'operation',
          user_id: user.id,
          data: { operation, clientId, clock }
        })

        return NextResponse.json({ success: true })
      }

      case 'get-operations': {
        // Get operations since last sync (for catching up)
        const { documentId, sinceVersion, sinceClock } = params

        const { data: operations } = await supabase
          .from('document_operations')
          .select('*')
          .eq('document_id', documentId)
          .gt('logical_clock', sinceClock || 0)
          .order('logical_clock', { ascending: true })

        return NextResponse.json({ success: true, operations: operations || [] })
      }

      case 'restore-version': {
        const { documentId, targetVersion } = params

        // Check access
        const hasAccess = await checkDocumentAccess(supabase, documentId, user.id, 'edit')
        if (!hasAccess) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // Get target version
        const { data: version } = await supabase
          .from('document_versions')
          .select('*')
          .eq('document_id', documentId)
          .eq('version', targetVersion)
          .single()

        if (!version) {
          return NextResponse.json({ error: 'Version not found' }, { status: 404 })
        }

        // Get current version
        const { data: doc } = await supabase
          .from('collaboration_documents')
          .select('current_version')
          .eq('id', documentId)
          .single()

        const newVersion = doc!.current_version + 1
        const checksum = generateChecksum(JSON.stringify(version.content))

        // Update document with restored content
        await supabase
          .from('collaboration_documents')
          .update({
            content: version.content,
            current_version: newVersion,
            checksum,
            last_modified_by: user.id
          })
          .eq('id', documentId)

        // Create restore version entry
        await supabase.from('document_versions').insert({
          document_id: documentId,
          version: newVersion,
          content: version.content,
          checksum,
          created_by: user.id,
          restored_from: targetVersion
        })

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'document_version_restored',
          resource_type: 'collaboration_document',
          resource_id: documentId,
          details: { fromVersion: targetVersion, toVersion: newVersion }
        })

        return NextResponse.json({
          success: true,
          version: newVersion,
          restoredFrom: targetVersion
        })
      }

      case 'compare-versions': {
        const { documentId, versionA, versionB } = params

        const { data: versions } = await supabase
          .from('document_versions')
          .select('*')
          .eq('document_id', documentId)
          .in('version', [versionA, versionB])

        if (versions?.length !== 2) {
          return NextResponse.json({ error: 'Versions not found' }, { status: 404 })
        }

        const [docA, docB] = versions.sort((a, b) => a.version - b.version)

        // In production, use a proper diff algorithm
        const diff = {
          versionA: docA.version,
          versionB: docB.version,
          contentA: docA.content,
          contentB: docB.content,
          createdAtA: docA.created_at,
          createdAtB: docB.created_at
        }

        return NextResponse.json({ success: true, diff })
      }

      case 'fork': {
        const { documentId, title } = params

        // Get original document
        const { data: original } = await supabase
          .from('collaboration_documents')
          .select('*')
          .eq('id', documentId)
          .single()

        if (!original) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        const newDocumentId = nanoid(16)

        // Create forked document
        const { data: forked, error } = await supabase
          .from('collaboration_documents')
          .insert({
            id: newDocumentId,
            title: title || `${original.title} (Fork)`,
            type: original.type,
            content: original.content,
            current_version: 1,
            owner_id: user.id,
            forked_from: documentId,
            checksum: original.checksum,
            last_modified_by: user.id
          })
          .select()
          .single()

        if (error) throw error

        // Create initial version
        await supabase.from('document_versions').insert({
          document_id: newDocumentId,
          version: 1,
          content: original.content,
          checksum: original.checksum,
          created_by: user.id
        })

        return NextResponse.json({ success: true, document: forked })
      }

      case 'merge': {
        const { documentId, sourceDocumentId, strategy } = params

        // Get both documents
        const { data: docs } = await supabase
          .from('collaboration_documents')
          .select('*')
          .in('id', [documentId, sourceDocumentId])

        if (docs?.length !== 2) {
          return NextResponse.json({ error: 'Documents not found' }, { status: 404 })
        }

        const target = docs.find(d => d.id === documentId)
        const source = docs.find(d => d.id === sourceDocumentId)

        // In production, use proper merge algorithm based on strategy
        // For now, we'll do a simple merge
        let mergedContent
        switch (strategy) {
          case 'target-wins':
            mergedContent = { ...source!.content, ...target!.content }
            break
          case 'source-wins':
            mergedContent = { ...target!.content, ...source!.content }
            break
          default:
            // Deep merge
            mergedContent = deepMerge(target!.content, source!.content)
        }

        const newVersion = target!.current_version + 1
        const checksum = generateChecksum(JSON.stringify(mergedContent))

        // Update target document
        await supabase
          .from('collaboration_documents')
          .update({
            content: mergedContent,
            current_version: newVersion,
            checksum,
            last_modified_by: user.id
          })
          .eq('id', documentId)

        // Create merge version
        await supabase.from('document_versions').insert({
          document_id: documentId,
          version: newVersion,
          content: mergedContent,
          checksum,
          created_by: user.id,
          merged_from: sourceDocumentId
        })

        return NextResponse.json({
          success: true,
          version: newVersion,
          mergedFrom: sourceDocumentId
        })
      }

      case 'lock': {
        const { documentId, lockType } = params

        await supabase
          .from('collaboration_documents')
          .update({
            is_locked: true,
            locked_by: user.id,
            lock_type: lockType || 'edit',
            locked_at: new Date().toISOString()
          })
          .eq('id', documentId)

        return NextResponse.json({ success: true })
      }

      case 'unlock': {
        const { documentId } = params

        // Only lock owner or document owner can unlock
        const { data: doc } = await supabase
          .from('collaboration_documents')
          .select('owner_id, locked_by')
          .eq('id', documentId)
          .single()

        if (doc?.locked_by !== user.id && doc?.owner_id !== user.id) {
          return NextResponse.json({ error: 'Cannot unlock document' }, { status: 403 })
        }

        await supabase
          .from('collaboration_documents')
          .update({
            is_locked: false,
            locked_by: null,
            lock_type: null,
            locked_at: null
          })
          .eq('id', documentId)

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Document action error', { error })
    return NextResponse.json(
      { error: 'Failed to perform document action' },
      { status: 500 }
    )
  }
}

// Helper functions
async function checkDocumentAccess(
  supabase: any,
  documentId: string,
  userId: string,
  permission: string = 'view'
): Promise<boolean> {
  // Check if owner
  const { data: doc } = await supabase
    .from('collaboration_documents')
    .select('owner_id')
    .eq('id', documentId)
    .single()

  if (doc?.owner_id === userId) return true

  // Check if collaborator with permission
  const { data: access } = await supabase
    .from('document_access')
    .select('*')
    .eq('document_id', documentId)
    .eq('user_id', userId)
    .single()

  if (!access) return false

  switch (permission) {
    case 'view':
      return true
    case 'edit':
      return access.can_edit
    case 'share':
      return access.can_share
    default:
      return false
  }
}

function generateChecksum(content: string): string {
  // Simple hash function - in production use crypto
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

function deepMerge(target: any, source: any): any {
  const output = { ...target }
  if (typeof target === 'object' && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (key in target) {
          output[key] = deepMerge(target[key], source[key])
        } else {
          output[key] = source[key]
        }
      } else {
        output[key] = source[key]
      }
    })
  }
  return output
}

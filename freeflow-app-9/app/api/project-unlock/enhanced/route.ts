import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

interface UnlockRequest {
  projectId: string
  method: 'password' | 'milestone' | 'escrow' | 'time_based'
  credentials?: {
    password?: string
    milestoneIds?: string[]
    escrowAmount?: number
    validUntil?: string
  }
  clientEmail?: string
}

interface DownloadTokenRequest {
  projectId: string
  deliverableId: string
  clientEmail: string
  accessLevel: 'preview' | 'full'
}

// Generate secure download token
function generateDownloadToken(data: any): string {
  return jwt.sign(
    {
      ...data,
      issued: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  )
}

// Generate secure file hash
function generateFileHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const action = body.action || 'unlock'

    switch (action) {
      case 'unlock':
        return handleUnlockRequest(body as UnlockRequest, supabase, user)
      
      case 'generate_token':
        return handleGenerateToken(body as DownloadTokenRequest, supabase, user)
      
      case 'validate_access':
        return handleValidateAccess(body, supabase, user)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Enhanced unlock API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleUnlockRequest(
  unlockData: UnlockRequest,
  supabase: any,
  user: any
) {
  try {
    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, escrow_status, milestones(*), unlock_methods(*)')
      .eq('id', unlockData.projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Validate unlock method
    const unlockMethod = project.unlock_methods?.find(
      (method: any) => method.type === unlockData.method && method.is_enabled
    )

    if (!unlockMethod) {
      return NextResponse.json(
        { error: 'Unlock method not available' },
        { status: 400 }
      )
    }

    let unlockSuccess = false
    let unlockMessage = ''
    let unlockedItems: string[] = []

    switch (unlockData.method) {
      case 'password':
        if (unlockData.credentials?.password === unlockMethod.conditions?.password) {
          unlockSuccess = true
          unlockMessage = 'Project unlocked with password authentication'
          unlockedItems = await unlockAllDeliverables(supabase, unlockData.projectId)
        } else {
          return NextResponse.json(
            { success: false, message: 'Invalid password' },
            { status: 401 }
          )
        }
        break

      case 'milestone':
        const completedMilestones = project.milestones?.filter(
          (m: any) => m.status === 'completed'
        ) || []
        
        const requiredMilestones = unlockMethod.conditions?.required_milestones || []
        const hasRequiredMilestones = requiredMilestones.every((id: string) =>
          completedMilestones.some((m: any) => m.id === id)
        )

        if (hasRequiredMilestones) {
          unlockSuccess = true
          unlockMessage = 'Project unlocked via milestone completion'
          unlockedItems = await unlockDeliverablesByMilestone(
            supabase, 
            unlockData.projectId, 
            completedMilestones.map((m: any) => m.id)
          )
        } else {
          return NextResponse.json(
            { success: false, message: 'Required milestones not completed' },
            { status: 400 }
          )
        }
        break

      case 'escrow':
        if (project.escrow_status === 'released') {
          unlockSuccess = true
          unlockMessage = 'Project unlocked via escrow release'
          unlockedItems = await unlockAllDeliverables(supabase, unlockData.projectId)
        } else {
          return NextResponse.json(
            { success: false, message: 'Escrow not yet released' },
            { status: 400 }
          )
        }
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported unlock method' },
          { status: 400 }
        )
    }

    if (unlockSuccess) {
      // Log unlock activity
      await supabase.from('project_activity').insert({
        project_id: unlockData.projectId,
        user_id: user?.id,
        action: 'unlock',
        details: {
          method: unlockData.method,
          unlocked_items: unlockedItems,
          timestamp: new Date().toISOString(),
          client_email: unlockData.clientEmail
        }
      })

      // Send notifications
      await sendUnlockNotifications(supabase, {
        projectId: unlockData.projectId,
        method: unlockData.method,
        clientEmail: unlockData.clientEmail,
        unlockedItems
      })

      return NextResponse.json({
        success: true,
        message: unlockMessage,
        unlockedItems,
        downloadTokens: await generateDownloadTokens(supabase, unlockData.projectId, unlockedItems)
      })
    }

    return NextResponse.json(
      { success: false, message: 'Unlock failed' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Unlock request error:', error)
    return NextResponse.json(
      { error: 'Failed to process unlock request' },
      { status: 500 }
    )
  }
}

async function handleGenerateToken(
  tokenData: DownloadTokenRequest,
  supabase: any,
  user: any
) {
  try {
    // Validate access to deliverable
    const { data: deliverable, error: deliverableError } = await supabase
      .from('deliverables')
      .select('*, projects(*)')
      .eq('id', tokenData.deliverableId)
      .eq('project_id', tokenData.projectId)
      .single()

    if (deliverableError || !deliverable) {
      return NextResponse.json(
        { error: 'Deliverable not found' },
        { status: 404 }
      )
    }

    // Check access permissions
    if (deliverable.status === 'locked' && tokenData.accessLevel === 'full') {
      return NextResponse.json(
        { error: 'Deliverable is locked' },
        { status: 403 }
      )
    }

    // Generate secure download token
    const tokenPayload = {
      projectId: tokenData.projectId,
      deliverableId: tokenData.deliverableId,
      clientEmail: tokenData.clientEmail,
      accessLevel: tokenData.accessLevel,
      fileHash: generateFileHash(deliverable.file_url || ''),
      downloadLimit: deliverable.download_limit || 10,
      validUntil: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    }

    const downloadToken = generateDownloadToken(tokenPayload)
    
    // Create secure download URL
    const downloadUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/secure-download/${downloadToken}`

    // Log token generation
    await supabase.from('download_tokens').insert({
      token: downloadToken,
      project_id: tokenData.projectId,
      deliverable_id: tokenData.deliverableId,
      client_email: tokenData.clientEmail,
      access_level: tokenData.accessLevel,
      expires_at: new Date(tokenPayload.validUntil).toISOString(),
      created_by: user?.id
    })

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresAt: new Date(tokenPayload.validUntil).toISOString(),
      downloadLimit: tokenPayload.downloadLimit
    })
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download token' },
      { status: 500 }
    )
  }
}

async function handleValidateAccess(
  validationData: any,
  supabase: any,
  user: any
) {
  try {
    const { projectId, clientEmail, deliverableId } = validationData

    // Check project access
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, client_access, security_settings')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Validate client access
    const hasAccess = project.client_access?.includes(clientEmail) || 
                     user?.email === clientEmail ||
                     project.created_by === user?.id

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get deliverable status
    let deliverableStatus = null
    if (deliverableId) {
      const { data: deliverable } = await supabase
        .from('deliverables')
        .select('status, access_level, download_count, view_count')
        .eq('id', deliverableId)
        .single()
      
      deliverableStatus = deliverable
    }

    return NextResponse.json({
      success: true,
      hasAccess: true,
      projectStatus: project.status,
      securityLevel: project.security_settings?.level || 'standard',
      deliverableStatus,
      accessLevel: project.client_access?.includes(clientEmail) ? 'client' : 'owner'
    })
  } catch (error) {
    console.error('Access validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate access' },
      { status: 500 }
    )
  }
}

// Helper functions
async function unlockAllDeliverables(supabase: any, projectId: string): Promise<string[]> {
  const { data: deliverables, error } = await supabase
    .from('deliverables')
    .select('id, name')
    .eq('project_id', projectId)
    .eq('status', 'locked')

  if (error || !deliverables) return []

  const deliverableIds = deliverables.map((d: any) => d.id)
  
  await supabase
    .from('deliverables')
    .update({ status: 'unlocked', unlocked_at: new Date().toISOString() })
    .in('id', deliverableIds)

  return deliverables.map((d: any) => d.name)
}

async function unlockDeliverablesByMilestone(
  supabase: any, 
  projectId: string, 
  milestoneIds: string[]
): Promise<string[]> {
  const { data: deliverables, error } = await supabase
    .from('deliverables')
    .select('id, name')
    .eq('project_id', projectId)
    .in('milestone_id', milestoneIds)
    .eq('status', 'locked')

  if (error || !deliverables) return []

  const deliverableIds = deliverables.map((d: any) => d.id)
  
  await supabase
    .from('deliverables')
    .update({ status: 'unlocked', unlocked_at: new Date().toISOString() })
    .in('id', deliverableIds)

  return deliverables.map((d: any) => d.name)
}

async function generateDownloadTokens(
  supabase: any,
  projectId: string,
  unlockedItems: string[]
): Promise<Record<string, string>> {
  const tokens: Record<string, string> = {}

  for (const itemName of unlockedItems) {
    const { data: deliverable } = await supabase
      .from('deliverables')
      .select('id, file_url')
      .eq('project_id', projectId)
      .eq('name', itemName)
      .single()

    if (deliverable) {
      const token = generateDownloadToken({
        projectId,
        deliverableId: deliverable.id,
        accessLevel: 'full',
        fileHash: generateFileHash(deliverable.file_url || '')
      })
      
      tokens[itemName] = token
    }
  }

  return tokens
}

async function sendUnlockNotifications(supabase: any, data: any) {
  try {
    // Get project and client details
    const { data: project } = await supabase
      .from('projects')
      .select('name, client_email, created_by')
      .eq('id', data.projectId)
      .single()

    if (project) {
      // Create notification for project owner
      await supabase.from('notifications').insert({
        user_id: project.created_by,
        type: 'project_unlocked',
        title: 'Project Unlocked',
        message: `Project "${project.name}" was unlocked using ${data.method} method`,
        data: {
          project_id: data.projectId,
          method: data.method,
          unlocked_items: data.unlockedItems
        }
      })

      // Create notification for client if email provided
      if (data.clientEmail) {
        await supabase.from('client_notifications').insert({
          email: data.clientEmail,
          type: 'download_ready',
          title: 'Files Ready for Download',
          message: `Your files for "${project.name}" are now ready for download`,
          data: {
            project_id: data.projectId,
            unlocked_items: data.unlockedItems
          }
        })
      }
    }
  } catch (error) {
    console.error('Failed to send unlock notifications:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const action = searchParams.get('action') || 'status'

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    switch (action) {
      case 'status':
        return getUnlockStatus(supabase, projectId, user)
      
      case 'methods':
        return getAvailableUnlockMethods(supabase, projectId, user)
      
      case 'history':
        return getUnlockHistory(supabase, projectId, user)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Enhanced unlock GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getUnlockStatus(supabase: any, projectId: string, user: any) {
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      id, name, status, escrow_status, completion_percentage,
      deliverables(id, name, status, unlocked_at),
      milestones(id, name, status, completed_at),
      unlock_methods(type, is_enabled, conditions, auto_trigger)
    `)
    .eq('id', projectId)
    .single()

  if (error || !project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }

  const unlockedDeliverables = project.deliverables?.filter(
    (d: any) => d.status === 'unlocked'
  ).length || 0
  
  const totalDeliverables = project.deliverables?.length || 0
  const unlockProgress = totalDeliverables > 0 ? (unlockedDeliverables / totalDeliverables) * 100 : 0

  return NextResponse.json({
    projectId: project.id,
    projectName: project.name,
    projectStatus: project.status,
    escrowStatus: project.escrow_status,
    completionPercentage: project.completion_percentage,
    unlockProgress,
    unlockedDeliverables,
    totalDeliverables,
    availableUnlockMethods: project.unlock_methods?.filter((m: any) => m.is_enabled) || [],
    milestoneStatus: project.milestones?.map((m: any) => ({
      id: m.id,
      name: m.name,
      status: m.status,
      completedAt: m.completed_at
    })) || []
  })
}

async function getAvailableUnlockMethods(supabase: any, projectId: string, user: any) {
  const { data: methods, error } = await supabase
    .from('unlock_methods')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_enabled', true)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch unlock methods' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    methods: methods || [],
    available: methods?.length > 0
  })
}

async function getUnlockHistory(supabase: any, projectId: string, user: any) {
  const { data: history, error } = await supabase
    .from('project_activity')
    .select('*')
    .eq('project_id', projectId)
    .eq('action', 'unlock')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch unlock history' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    history: history || []
  })
} 
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface VideoAnnotation {
  id: string
  fileId: string
  userId: string
  content: string
  timestamp: number
  type: 'comment' | 'note' | 'suggestion' | 'issue' | 'approval_required
  isResolved: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent
  mentions: string[]
  reactions: Reaction[]
  createdAt: string
}

interface ImageAnnotation {
  id: string
  fileId: string
  userId: string
  content: string
  position: { x: number; y: number }
  type: 'comment' | 'note' | 'suggestion' | 'issue' | 'approval_required
  isResolved: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent
  mentions: string[]
  reactions: Reaction[]
  createdAt: string
}

interface Reaction {
  userId: string
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'approve' | 'reject
  createdAt: string
}

interface ProjectCollaboration {
  id: string
  projectId: string
  escrowStatus: 'pending' | 'funded' | 'milestone_released' | 'fully_released
  downloadPassword?: string
  videoAnnotations: VideoAnnotation[]
  imageAnnotations: ImageAnnotation[]
  approvalWorkflow: ApprovalStep[]
  realTimeActivity: ActivityEvent[]
  clientPreferences: ClientPreference[]
}

interface ApprovalStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'revision_requested
  requiredApprovers: string[]
  completedApprovers: string[]
  dueDate?: string
  autoAdvance: boolean
  escrowTrigger: boolean
}

interface ActivityEvent {
  id: string
  type: 'annotation_added' | 'approval_given' | 'file_uploaded' | 'escrow_updated' | 'download_unlocked
  userId: string
  data: unknown
  timestamp: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent
}

interface ClientPreference {
  id: string
  fileId: string
  userId: string
  type: 'favorite' | 'like' | 'dislike' | 'selected_for_final
  notes?: string
  createdAt: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const action = body.action

    switch (action) {
      case 'add_video_annotation':
        return handleAddVideoAnnotation(body, supabase, user)
      
      case 'add_image_annotation':
        return handleAddImageAnnotation(body, supabase, user)
      
      case 'update_client_preference':
        return handleUpdateClientPreference(body, supabase, user)
      
      case 'submit_approval':
        return handleSubmitApproval(body, supabase, user)
      
      case 'trigger_escrow_release':
        return handleEscrowRelease(body, supabase, user)
      
      case 'generate_download_access':
        return handleGenerateDownloadAccess(body, supabase, user)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleAddVideoAnnotation(data: unknown, supabase: unknown, user: unknown) {
  try {
    const { fileId, content, timestamp, type, priority, mentions } = data

    // Validate file access
    const { data: file, error: fileError } = await supabase
      .from('media_files
      .select('id, name, project_id, type
      .eq('id', fileId)
      .eq('type', 'video
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'Video file not found or access denied' },
        { status: 404 }
      )
    }

    // Create video annotation
    const annotation: VideoAnnotation = {
      id: `va_${Date.now()}`,
      fileId,
      userId: user.id,
      content,
      timestamp,
      type,
      isResolved: false,
      priority: priority || 'medium,
      mentions: mentions || [],
      reactions: [],
      createdAt: new Date().toISOString()
    }

    // Save to database
    const { data: savedAnnotation, error: saveError } = await supabase
      .from('video_annotations
      .insert(annotation)
      .select()
      .single()

    if (saveError) {
      return NextResponse.json(
        { error: 'Failed to save video annotation' },
        { status: 500 }
      )
    }

    // Create real-time activity event
    await createActivityEvent(supabase, {
      projectId: file.project_id,
      type: 'annotation_added,'
      userId: user.id,
      data: {
        annotationType: 'video,'
        fileId,
        filename: file.name,
        timestamp,
        content: content.substring(0, 100),
        priority
      },
      priority: type === 'approval_required' ? 'high' : 'medium'
    })

    // Send real-time notifications to mentioned users
    if (mentions && mentions.length > 0) {
      await sendMentionNotifications(supabase, {
        mentions,
        annotationType: 'video,'
        fileId,
        filename: file.name,
        content,
        timestamp,
        mentionedBy: user.id,
        projectId: file.project_id
      })
    }

    // Check if this triggers approval workflow
    if (type === 'approval_required') {
      await checkApprovalWorkflow(supabase, file.project_id, {
        type: 'annotation_approval,'
        annotationId: annotation.id,
        fileId,
        priority
      })
    }

    return NextResponse.json({
      success: true,
      annotation: savedAnnotation,
      message: 'Video annotation added successfully'
    })
  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return NextResponse.json(
      { error: 'Failed to add video annotation' },
      { status: 500 }
    )
  }
}

async function handleAddImageAnnotation(data: unknown, supabase: unknown, user: unknown) {
  try {
    const { fileId, content, position, type, priority, mentions } = data

    // Validate file access
    const { data: file, error: fileError } = await supabase
      .from('media_files
      .select('id, name, project_id, type
      .eq('id', fileId)
      .eq('type', 'image
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'Image file not found or access denied' },
        { status: 404 }
      )
    }

    // Create image annotation
    const annotation: ImageAnnotation = {
      id: `ia_${Date.now()}`,
      fileId,
      userId: user.id,
      content,
      position,
      type,
      isResolved: false,
      priority: priority || 'medium,
      mentions: mentions || [],
      reactions: [],
      createdAt: new Date().toISOString()
    }

    // Save to database
    const { data: savedAnnotation, error: saveError } = await supabase
      .from('image_annotations
      .insert(annotation)
      .select()
      .single()

    if (saveError) {
      return NextResponse.json(
        { error: 'Failed to save image annotation' },
        { status: 500 }
      )
    }

    // Create real-time activity event
    await createActivityEvent(supabase, {
      projectId: file.project_id,
      type: 'annotation_added,'
      userId: user.id,
      data: {
        annotationType: 'image,'
        fileId,
        filename: file.name,
        position,
        content: content.substring(0, 100),
        priority
      },
      priority: type === 'approval_required' ? 'high' : 'medium'
    })

    // Send real-time notifications to mentioned users
    if (mentions && mentions.length > 0) {
      await sendMentionNotifications(supabase, {
        mentions,
        annotationType: 'image,'
        fileId,
        filename: file.name,
        content,
        position,
        mentionedBy: user.id,
        projectId: file.project_id
      })
    }

    return NextResponse.json({
      success: true,
      annotation: savedAnnotation,
      message: 'Image annotation added successfully'
    })
  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return NextResponse.json(
      { error: 'Failed to add image annotation' },
      { status: 500 }
    )
  }
}

async function handleUpdateClientPreference(data: unknown, supabase: unknown, user: unknown) {
  try {
    const { fileId, type, notes } = data

    // Validate file access
    const { data: file, error: fileError } = await supabase
      .from('media_files
      .select('id, name, project_id
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'File not found or access denied' },
        { status: 404 }
      )
    }

    // Check if preference already exists
    const { data: existingPreference } = await supabase
      .from('client_preferences
      .select('id
      .eq('file_id', fileId)
      .eq('user_id', user.id)
      .single()

    let preference
    if (existingPreference) {
      // Update existing preference
      const { data: updatedPreference, error: updateError } = await supabase
        .from('client_preferences
        .update({
          type,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPreference.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update preference' },
          { status: 500 }
        )
      }
      preference = updatedPreference
    } else {
      // Create new preference
      const { data: newPreference, error: createError } = await supabase
        .from('client_preferences
        .insert({
          file_id: fileId,
          user_id: user.id,
          type,
          notes,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create preference' },
          { status: 500 }
        )
      }
      preference = newPreference
    }

    // Create real-time activity event
    await createActivityEvent(supabase, {
      projectId: file.project_id,
      type: 'preference_updated,'
      userId: user.id,
      data: {
        fileId,
        filename: file.name,
        preferenceType: type,
        notes
      },
      priority: type === 'selected_for_final' ? 'high' : 'low'
    })

    return NextResponse.json({
      success: true,
      preference,
      message: `File ${type.replace('_', ' ')} successfully
    })
  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return NextResponse.json(
      { error: 'Failed to update preference' },
      { status: 500 }
    )
  }
}

async function handleSubmitApproval(data: unknown, supabase: unknown, user: unknown) {
  try {
    const { projectId, stepId, status, comments, triggerEscrow } = data

    // Validate project access
    const { data: project, error: projectError } = await supabase
      .from('projects
      .select('id, name, escrow_status
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      )
    }

    // Update approval step
    const { data: updatedStep, error: stepError } = await supabase
      .from('approval_steps
      .update({
        status,
        [`${user.id}_approved_at`]: new Date().toISOString(),
        [`${user.id}_comments`]: comments,
        updated_at: new Date().toISOString()
      })
      .eq('id', stepId)
      .eq('project_id', projectId)
      .select()
      .single()

    if (stepError) {
      return NextResponse.json(
        { error: 'Failed to update approval step' },
        { status: 500 }
      )
    }

    // Check if all required approvers have approved
    const allApproved = await checkAllApproversCompleted(supabase, stepId)

    if (allApproved && status === 'approved') {
      // Mark step as completed
      await supabase
        .from('approval_steps
        .update({
          status: 'approved,'
          completed_at: new Date().toISOString()
        })
        .eq('id', stepId)

      // Check if this should trigger escrow release
      if (triggerEscrow && updatedStep.escrow_trigger) {
        await handleEscrowRelease({ projectId, stepId }, supabase, user)
      }

      // Auto-advance to next step if configured
      if (updatedStep.auto_advance) {
        await advanceToNextApprovalStep(supabase, projectId, stepId)
      }
    }

    // Create real-time activity event
    await createActivityEvent(supabase, {
      projectId,
      type: 'approval_given,'
      userId: user.id,
      data: {
        stepId,
        stepName: updatedStep.name,
        approvalStatus: status,
        comments,
        allApproved
      },
      priority: status === 'rejected' ? 'high' : 'medium'
    })

    return NextResponse.json({
      success: true,
      step: updatedStep,
      allApproved,
      message: `Approval ${status} successfully
    })
  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return NextResponse.json(
      { error: 'Failed to submit approval' },
      { status: 500 }
    )
  }
}

async function handleEscrowRelease(data: unknown, supabase: unknown, user: unknown) {
  try {
    const { projectId, stepId, amount } = data

    // Validate project and escrow status
    const { data: project, error: projectError } = await supabase
      .from('projects
      .select('id, name, escrow_status, escrow_amount, download_password
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.escrow_status === 'fully_released') {
      return NextResponse.json(
        { error: 'Escrow already fully released' },
        { status: 400 }
      )
    }

    // Determine release type
    const releaseAmount = amount || project.escrow_amount
    const isFullRelease = releaseAmount === project.escrow_amount
    const newEscrowStatus = isFullRelease ? 'fully_released' : 'milestone_released'

    // Update project escrow status
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects
      .update({
        escrow_status: newEscrowStatus,
        [`escrow_released_${Date.now()}`]: {
          amount: releaseAmount,
          released_by: user.id,
          released_at: new Date().toISOString(),
          step_id: stepId
        }
      })
      .eq('id', projectId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update escrow status' },
        { status: 500 }
      )
    }

    // Generate download password if full release
    let downloadPassword = project.download_password
    if (isFullRelease && !downloadPassword) {
      downloadPassword = generateSecurePassword()
      
      await supabase
        .from('projects
        .update({ download_password: downloadPassword })
        .eq('id', projectId)
    }

    // Unlock project deliverables if full release
    if (isFullRelease) {
      await supabase
        .from('deliverables
        .update({
          status: 'unlocked,'
          unlocked_at: new Date().toISOString(),
          unlock_method: 'escrow_release'
        })
        .eq('project_id', projectId)
        .eq('status', 'locked
    }

    // Create real-time activity event
    await createActivityEvent(supabase, {
      projectId,
      type: 'escrow_updated,'
      userId: user.id,
      data: {
        releaseType: isFullRelease ? 'full_release' : 'milestone_release,'
        amount: releaseAmount,
        newStatus: newEscrowStatus,
        downloadPassword: isFullRelease ? downloadPassword : null
      },
      priority: 'high'
    })

    // Send notification to client about download access
    if (isFullRelease) {
      await sendDownloadReadyNotification(supabase, {
        projectId,
        projectName: project.name,
        downloadPassword,
        clientId: user.id
      })
    }

    return NextResponse.json({
      success: true,
      escrowStatus: newEscrowStatus,
      downloadPassword: isFullRelease ? downloadPassword : null,
      unlockedDeliverables: isFullRelease,
      message: `Escrow ${isFullRelease ? 'fully' : 'partially'} released successfully
    })
  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return NextResponse.json(
      { error: 'Failed to release escrow' },
      { status: 500 }
    )
  }
}

async function handleGenerateDownloadAccess(data: unknown, supabase: unknown, user: unknown) {
  try {
    const { projectId, password } = data

    // Validate project and password
    const { data: project, error: projectError } = await supabase
      .from('projects
      .select('id, name, download_password, escrow_status
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if escrow is released
    if (project.escrow_status !== 'fully_released') {
      return NextResponse.json(
        { error: 'Project downloads not yet available - escrow not fully released' },
        { status: 403 }
      )
    }

    // Validate password
    if (project.download_password !== password) {
      return NextResponse.json(
        { error: 'Invalid download password' },
        { status: 401 }
      )
    }

    // Generate secure download tokens for all deliverables
    const { data: deliverables, error: deliverablesError } = await supabase
      .from('deliverables
      .select('id, name, file_url, status
      .eq('project_id', projectId)
      .eq('status', 'unlocked

    if (deliverablesError) {
      return NextResponse.json(
        { error: 'Failed to fetch deliverables' },
        { status: 500 }
      )
    }

    // Generate download tokens
    const downloadTokens = await Promise.all(
      deliverables.map(async (deliverable: unknown) => {
        const token = await generateDownloadToken(supabase, {
          projectId,
          deliverableId: deliverable.id,
          userId: user.id,
          expiresIn: 24 * 60 * 60 * 1000 // 24 hours
        })

        return {
          deliverableId: deliverable.id,
          name: deliverable.name,
          downloadUrl: `/api/secure-download/${token}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      })
    )

    // Log download access
    await supabase.from('download_logs').insert({
      project_id: projectId,
      user_id: user.id,
      access_granted_at: new Date().toISOString(),
      deliverables_count: downloadTokens.length
    })

    // Create real-time activity event
    await createActivityEvent(supabase, {
      projectId,
      type: 'download_unlocked,'
      userId: user.id,
      data: {
        deliverableCount: downloadTokens.length,
        accessMethod: 'password'
      },
      priority: 'medium'
    })

    return NextResponse.json({
      success: true,
      downloadTokens,
      expiresIn: '24 hours,'
      message: 'Download access granted successfully'
    })
  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return NextResponse.json(
      { error: 'Failed to generate download access' },
      { status: 500 }
    )
  }
}

// Helper functions
async function createActivityEvent(supabase: unknown, eventData: unknown) {
  try {
    await supabase.from('real_time_activity').insert({
      id: `act_${Date.now()}`,
      project_id: eventData.projectId,
      type: eventData.type,
      user_id: eventData.userId,
      data: eventData.data,
      timestamp: new Date().toISOString(),
      is_read: false,
      priority: eventData.priority || 'medium
    })

    // Trigger real-time notification (WebSocket/SSE)
    // In production, this would trigger actual real-time updates
    console.log('Real-time activity created: ', eventData)'
  } catch (error) {
    console.error(match.replace(/'$/g, ))
  }
}

async function sendMentionNotifications(supabase: unknown, data: unknown) {
  try {
    for (const mentionedUserId of data.mentions) {
      await supabase.from('notifications').insert({
        user_id: mentionedUserId,
        type: 'mention,'
        title: `You were mentioned in ${data.annotationType} annotation`,
        message: `${data.mentionedBy} mentioned you in ${data.filename}`,
        data: {
          annotation_type: data.annotationType,
          file_id: data.fileId,
          filename: data.filename,
          content: data.content,
          timestamp: data.timestamp,
          position: data.position,
          project_id: data.projectId
        },
        priority: 'medium,'
        is_read: false,
        created_at: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error(match.replace(/'$/g, ))
  }
}

async function checkApprovalWorkflow(supabase: unknown, projectId: string, data: unknown) {
  try {
    // Check if there are pending approval steps that need attention
    const { data: pendingSteps } = await supabase
      .from('approval_steps
      .select('*
      .eq('project_id', projectId)
      .eq('status', 'pending
      .order('order

    if (pendingSteps && pendingSteps.length > 0) {
      // Auto-advance to the first pending step if annotation requires approval
      if (data.priority === 'urgent' || data.type === 'annotation_approval') {
        await supabase
          .from('approval_steps
          .update({ status: 'in_progress' })
          .eq('id', pendingSteps[0].id)
      }
    }
  } catch (error) {
    console.error(match.replace(/'$/g, ))
  }
}

async function checkAllApproversCompleted(supabase: unknown, stepId: string): Promise<boolean> {
  try {
    const { data: step } = await supabase
      .from('approval_steps
      .select('required_approvers, *
      .eq('id', stepId)
      .single()

    if (!step || !step.required_approvers) return false

    // Check if all required approvers have submitted their approval
    const approvalFields = step.required_approvers.map((approverId: string) => 
      `${approverId}_approved_at
    )

    return approvalFields.every((field: string) => step[field] !== null)
  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return false
  }
}

async function advanceToNextApprovalStep(supabase: unknown, projectId: string, currentStepId: string) {
  try {
    const { data: nextStep } = await supabase
      .from('approval_steps
      .select('*
      .eq('project_id', projectId)
      .eq('status', 'pending
      .order('order
      .limit(1)
      .single()

    if (nextStep) {
      await supabase
        .from('approval_steps
        .update({
          status: 'in_progress,'
          started_at: new Date().toISOString()
        })
        .eq('id', nextStep.id)
    }
  } catch (error) {
    console.error(match.replace(/'$/g, ))
  }
}

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
  let password = 
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

async function generateDownloadToken(supabase: unknown, data: unknown): Promise<string> {
  const token = `dt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}
  
  await supabase.from('download_tokens').insert({
    token,
    project_id: data.projectId,
    deliverable_id: data.deliverableId,
    user_id: data.userId,
    expires_at: new Date(Date.now() + data.expiresIn).toISOString(),
    created_at: new Date().toISOString()
  })

  return token
}

async function sendDownloadReadyNotification(supabase: unknown, data: unknown) {
  try {
    await supabase.from('notifications').insert({
      user_id: data.clientId,
      type: 'download_ready,'
      title: 'Project Downloads Ready!,'
      message: `Your project "${data.projectName}" is complete and ready for download`,
      data: {
        project_id: data.projectId,
        download_password: data.downloadPassword
      },
      priority: 'high,'
      is_read: false,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error(match.replace(/'$/g, ))
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action
    const projectId = searchParams.get('projectId
    const fileId = searchParams.get('fileId

    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    switch (action) {
      case 'get_annotations':
        return getFileAnnotations(supabase, fileId, user)
      
      case 'get_preferences':
        return getClientPreferences(supabase, projectId, user)
      
      case 'get_activity':
        return getRealTimeActivity(supabase, projectId, user)
      
      case 'get_approval_status':
        return getApprovalStatus(supabase, projectId, user)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error(match.replace(/'$/g, ))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getFileAnnotations(supabase: unknown, fileId: string | null, user: unknown) {
  if (!fileId) {
    return NextResponse.json(
      { error: 'File ID required' },
      { status: 400 }
    )
  }

  const [videoAnnotations, imageAnnotations] = await Promise.all([
    supabase
      .from('video_annotations
      .select('*, user:users(id, email, full_name)
      .eq('file_id', fileId)
      .order('timestamp
    
    supabase
      .from('image_annotations
      .select('*, user:users(id, email, full_name)
      .eq('file_id', fileId)
      .order('created_at
  ])

  return NextResponse.json({
    videoAnnotations: videoAnnotations.data || [],
    imageAnnotations: imageAnnotations.data || [],
    total: (videoAnnotations.data?.length || 0) + (imageAnnotations.data?.length || 0)
  })
}

async function getClientPreferences(supabase: unknown, projectId: string | null, user: unknown) {
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    )
  }

  const { data: preferences, error } = await supabase
    .from('client_preferences
    .select(
      *,
      media_file:media_files(id, name, type, thumbnail_url)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    preferences: preferences || [],
    summary: {
      favorites: preferences?.filter((p: unknown) => p.type === 'favorite').length || 0,
      likes: preferences?.filter((p: unknown) => p.type === 'like').length || 0,
      selected: preferences?.filter((p: unknown) => p.type === 'selected_for_final').length || 0
    }
  })
}

async function getRealTimeActivity(supabase: unknown, projectId: string | null, user: unknown) {
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    )
  }

  const { data: activity, error } = await supabase
    .from('real_time_activity
    .select(
      *,
      user:users(id, email, full_name, avatar_url)
    `)
    .eq('project_id', projectId)
    .order('timestamp', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    activity: activity || [],
    unreadCount: activity?.filter((a: unknown) => !a.is_read && a.user_id !== user.id).length || 0
  })
}

async function getApprovalStatus(supabase: unknown, projectId: string | null, user: unknown) {
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID required' },
      { status: 400 }
    )
  }

  const { data: steps, error } = await supabase
    .from('approval_steps
    .select('*
    .eq('project_id', projectId)
    .order('order

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch approval status' },
      { status: 500 }
    )
  }

  const currentStep = steps?.find((step: unknown) => step.status === 'in_progress') || 
                     steps?.find((step: unknown) => step.status === 'pending

  return NextResponse.json({
    steps: steps || [],
    currentStep,
    overallProgress: steps ? (steps.filter((s: unknown) => s.status === 'approved').length / steps.length) * 100 : 0
  })
} 
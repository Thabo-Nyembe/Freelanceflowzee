/**
 * Contracts API Route
 * Comprehensive contract management with milestones, signatures, and templates
 * Full database implementation with demo mode fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createSimpleLogger } from '@/lib/simple-logger'
import { randomBytes } from 'crypto'

const logger = createSimpleLogger('contracts-api')

// Demo mode support
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

// Contract status type
type ContractStatus = 'draft' | 'pending_signature' | 'active' | 'completed' | 'expired' | 'cancelled' | 'disputed'
type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'approved'

interface ContractMilestone {
  id?: string
  name: string
  description?: string
  value: number
  status: MilestoneStatus
  due_date?: string
  completed_date?: string
}

// Demo contracts data
const demoContracts = [
  {
    id: 'contract-001',
    title: 'Enterprise Software Development Agreement',
    client_id: 'client-001',
    client_name: 'TechCorp Industries',
    client_email: 'contracts@techcorp.com',
    status: 'active' as ContractStatus,
    value: 125000,
    currency: 'USD',
    start_date: '2024-01-15',
    end_date: '2024-12-31',
    description: 'Full-stack development services for enterprise platform',
    scope: 'Design, development, testing, and deployment of enterprise CRM system',
    payment_terms: 'Net 30',
    payment_schedule: 'milestone',
    milestones: [
      { id: 'm1', name: 'Phase 1: Discovery', value: 25000, status: 'completed' as MilestoneStatus, due_date: '2024-02-15', completed_date: '2024-02-10' },
      { id: 'm2', name: 'Phase 2: Development', value: 75000, status: 'in_progress' as MilestoneStatus, due_date: '2024-08-31' },
      { id: 'm3', name: 'Phase 3: Deployment', value: 25000, status: 'pending' as MilestoneStatus, due_date: '2024-12-15' }
    ],
    signed_by_client: true,
    signed_by_freelancer: true,
    client_signature_date: '2024-01-10',
    freelancer_signature_date: '2024-01-08',
    terms_accepted: true,
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-03-15T14:30:00Z'
  },
  {
    id: 'contract-002',
    title: 'Brand Identity & Marketing Package',
    client_id: 'client-002',
    client_name: 'GreenEarth Ventures',
    client_email: 'legal@greenearth.com',
    status: 'active' as ContractStatus,
    value: 45000,
    currency: 'USD',
    start_date: '2024-02-01',
    end_date: '2024-06-30',
    description: 'Complete brand refresh including logo, guidelines, and marketing collateral',
    scope: 'Brand strategy, logo design, brand guidelines, marketing materials',
    payment_terms: 'Net 15',
    payment_schedule: 'milestone',
    milestones: [
      { id: 'm1', name: 'Brand Discovery', value: 10000, status: 'completed' as MilestoneStatus },
      { id: 'm2', name: 'Design Development', value: 25000, status: 'completed' as MilestoneStatus },
      { id: 'm3', name: 'Final Delivery', value: 10000, status: 'in_progress' as MilestoneStatus }
    ],
    signed_by_client: true,
    signed_by_freelancer: true,
    terms_accepted: true,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-03-10T11:00:00Z'
  },
  {
    id: 'contract-003',
    title: 'Mobile App Maintenance Retainer',
    client_id: 'client-003',
    client_name: 'HealthFirst Medical',
    client_email: 'tech@healthfirst.com',
    status: 'active' as ContractStatus,
    value: 8500,
    currency: 'USD',
    start_date: '2024-03-01',
    end_date: '2025-02-28',
    description: 'Monthly retainer for iOS and Android app maintenance and updates',
    scope: 'Bug fixes, security updates, feature enhancements, 24/7 support',
    payment_terms: 'Monthly',
    payment_schedule: 'recurring',
    milestones: [],
    signed_by_client: true,
    signed_by_freelancer: true,
    terms_accepted: true,
    created_at: '2024-02-15T14:00:00Z',
    updated_at: '2024-03-01T08:00:00Z'
  },
  {
    id: 'contract-004',
    title: 'E-commerce Platform Build',
    client_id: 'client-004',
    client_name: 'Artisan Collective',
    client_email: 'orders@artisan.com',
    status: 'pending_signature' as ContractStatus,
    value: 78000,
    currency: 'USD',
    start_date: '2024-04-15',
    end_date: '2024-09-30',
    description: 'Custom e-commerce platform with inventory management and payment processing',
    scope: 'E-commerce website, inventory system, payment integration, admin dashboard',
    payment_terms: 'Net 30',
    payment_schedule: 'milestone',
    milestones: [
      { id: 'm1', name: 'Platform Setup', value: 20000, status: 'pending' as MilestoneStatus },
      { id: 'm2', name: 'Feature Development', value: 40000, status: 'pending' as MilestoneStatus },
      { id: 'm3', name: 'Launch & Training', value: 18000, status: 'pending' as MilestoneStatus }
    ],
    signed_by_client: false,
    signed_by_freelancer: true,
    terms_accepted: false,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z'
  },
  {
    id: 'contract-005',
    title: 'Video Production Series',
    client_id: 'client-005',
    client_name: 'EduLearn Academy',
    client_email: 'content@edulearn.com',
    status: 'completed' as ContractStatus,
    value: 35000,
    currency: 'USD',
    start_date: '2023-10-01',
    end_date: '2024-01-31',
    description: '20-episode educational video series with animations and graphics',
    scope: 'Script writing, video production, animation, post-production',
    payment_terms: 'Net 30',
    payment_schedule: 'milestone',
    milestones: [
      { id: 'm1', name: 'Pre-production', value: 7000, status: 'completed' as MilestoneStatus },
      { id: 'm2', name: 'Production', value: 20000, status: 'completed' as MilestoneStatus },
      { id: 'm3', name: 'Post-production', value: 8000, status: 'completed' as MilestoneStatus }
    ],
    signed_by_client: true,
    signed_by_freelancer: true,
    terms_accepted: true,
    created_at: '2023-09-15T09:00:00Z',
    updated_at: '2024-02-01T16:00:00Z'
  }
]

// ========================================================================
// GET - Fetch contracts
// ========================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const contractId = url.searchParams.get('id')
    const clientId = url.searchParams.get('client_id')

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Demo mode response
    if (demoMode || effectiveUserId === DEMO_USER_ID) {
      // Single contract by ID
      if (contractId) {
        const contract = demoContracts.find(c => c.id === contractId)
        if (!contract) {
          return NextResponse.json(
            { success: false, error: 'Contract not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({
          success: true,
          demo: true,
          data: contract
        })
      }

      // Filter contracts
      let filteredContracts = demoContracts
      if (status && status !== 'all') {
        filteredContracts = demoContracts.filter(c => c.status === status)
      }
      if (clientId) {
        filteredContracts = filteredContracts.filter(c => c.client_id === clientId)
      }

      // Calculate stats
      const totalValue = demoContracts.reduce((sum, c) => sum + c.value, 0)
      const activeValue = demoContracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0)
      const completedValue = demoContracts.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.value, 0)

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          contracts: filteredContracts,
          stats: {
            total_contracts: demoContracts.length,
            active_contracts: demoContracts.filter(c => c.status === 'active').length,
            pending_signature: demoContracts.filter(c => c.status === 'pending_signature').length,
            completed_contracts: demoContracts.filter(c => c.status === 'completed').length,
            expired_contracts: demoContracts.filter(c => c.status === 'expired').length,
            total_value: totalValue,
            active_value: activeValue,
            completed_value: completedValue,
            average_contract_value: Math.round(totalValue / demoContracts.length)
          }
        }
      })
    }

    // Real database query
    // Single contract by ID
    if (contractId) {
      const { data: contract, error } = await supabase
        .from('contracts')
        .select(`
          *,
          milestones:contract_milestones(*),
          client:clients(id, name, email, company)
        `)
        .eq('id', contractId)
        .eq('user_id', effectiveUserId)
        .single()

      if (error || !contract) {
        logger.warn('Contract not found', { contractId, error })
        return NextResponse.json(
          { success: false, error: 'Contract not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: contract
      })
    }

    // Build query
    let query = supabase
      .from('contracts')
      .select(`
        *,
        milestones:contract_milestones(id, name, value, status, due_date),
        client:clients(id, name, email)
      `)
      .eq('user_id', effectiveUserId)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data: contracts, error } = await query.order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch contracts', { error })
      return NextResponse.json({
        success: true,
        demo: true,
        data: { contracts: [], stats: { total_contracts: 0 } }
      })
    }

    // Calculate stats
    const allContracts = contracts || []
    const stats = {
      total_contracts: allContracts.length,
      active_contracts: allContracts.filter(c => c.status === 'active').length,
      pending_signature: allContracts.filter(c => c.status === 'pending_signature').length,
      completed_contracts: allContracts.filter(c => c.status === 'completed').length,
      total_value: allContracts.reduce((sum, c) => sum + (c.value || 0), 0),
      active_value: allContracts.filter(c => c.status === 'active').reduce((sum, c) => sum + (c.value || 0), 0)
    }

    return NextResponse.json({
      success: true,
      data: { contracts: allContracts, stats }
    })
  } catch (error) {
    logger.error('Contracts GET error', { error })
    return NextResponse.json({
      success: true,
      demo: true,
      data: { contracts: demoContracts, stats: { total_contracts: demoContracts.length } }
    })
  }
}

// ========================================================================
// POST - Create contract or perform actions
// ========================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { action, ...data } = body

    logger.info('Contract action received', { action, userId: effectiveUserId, demoMode })

    switch (action) {
      case 'create':
        return handleCreateContract(supabase, effectiveUserId, data, demoMode)

      case 'send':
        return handleSendContract(supabase, effectiveUserId, data, demoMode)

      case 'sign':
        return handleSignContract(supabase, effectiveUserId, data, demoMode)

      case 'approve-milestone':
        return handleApproveMilestone(supabase, effectiveUserId, data, demoMode)

      case 'complete-milestone':
        return handleCompleteMilestone(supabase, effectiveUserId, data, demoMode)

      case 'add-milestone':
        return handleAddMilestone(supabase, effectiveUserId, data, demoMode)

      case 'terminate':
        return handleTerminateContract(supabase, effectiveUserId, data, demoMode)

      case 'renew':
        return handleRenewContract(supabase, effectiveUserId, data, demoMode)

      case 'duplicate':
        return handleDuplicateContract(supabase, effectiveUserId, data, demoMode)

      case 'create-from-template':
        return handleCreateFromTemplate(supabase, effectiveUserId, data, demoMode)

      default:
        // Default: create contract
        return handleCreateContract(supabase, effectiveUserId, body, demoMode)
    }
  } catch (error) {
    logger.error('Contracts POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process contract request' },
      { status: 500 }
    )
  }
}

// ========================================================================
// Contract Action Handlers
// ========================================================================

async function handleCreateContract(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    title: string
    client_id?: string
    client_name?: string
    client_email?: string
    value: number
    currency?: string
    start_date: string
    end_date: string
    description?: string
    scope?: string
    payment_terms?: string
    payment_schedule?: string
    milestones?: ContractMilestone[]
    terms?: string
  },
  demoMode: boolean
): Promise<NextResponse> {
  // Validate required fields
  if (!data.title || !data.value || !data.start_date || !data.end_date) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: title, value, start_date, end_date' },
      { status: 400 }
    )
  }

  const contractId = randomBytes(8).toString('hex')

  if (demoMode || userId === DEMO_USER_ID) {
    const newContract = {
      id: `contract-${contractId}`,
      user_id: userId,
      ...data,
      status: 'draft' as ContractStatus,
      signed_by_client: false,
      signed_by_freelancer: false,
      terms_accepted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      demo: true,
      data: newContract,
      message: 'Contract created successfully (demo mode)'
    })
  }

  // Create contract in database
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .insert({
      user_id: userId,
      title: data.title,
      client_id: data.client_id || null,
      client_name: data.client_name || null,
      client_email: data.client_email || null,
      value: data.value,
      currency: data.currency || 'USD',
      start_date: data.start_date,
      end_date: data.end_date,
      description: data.description || null,
      scope: data.scope || null,
      payment_terms: data.payment_terms || 'Net 30',
      payment_schedule: data.payment_schedule || 'milestone',
      terms: data.terms || null,
      status: 'draft',
      signed_by_client: false,
      signed_by_freelancer: false,
      terms_accepted: false
    })
    .select()
    .single()

  if (contractError) {
    logger.error('Failed to create contract', { error: contractError })
    return NextResponse.json(
      { success: false, error: 'Failed to create contract' },
      { status: 500 }
    )
  }

  // Create milestones if provided
  if (data.milestones && data.milestones.length > 0) {
    const milestoneInserts = data.milestones.map((m, index) => ({
      contract_id: contract.id,
      name: m.name,
      description: m.description || null,
      value: m.value,
      status: 'pending',
      due_date: m.due_date || null,
      order_index: index
    }))

    await supabase.from('contract_milestones').insert(milestoneInserts)
  }

  logger.info('Contract created', { contractId: contract.id, userId })

  return NextResponse.json({
    success: true,
    data: contract,
    message: 'Contract created successfully'
  })
}

async function handleSendContract(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { contractId: string; message?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.contractId) {
    return NextResponse.json(
      { success: false, error: 'Contract ID is required' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: { contractId: data.contractId, status: 'pending_signature', sent_at: new Date().toISOString() },
      message: 'Contract sent for signature (demo mode)'
    })
  }

  const { data: contract, error } = await supabase
    .from('contracts')
    .update({
      status: 'pending_signature',
      sent_at: new Date().toISOString(),
      signed_by_freelancer: true,
      freelancer_signature_date: new Date().toISOString()
    })
    .eq('id', data.contractId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to send contract', { error, contractId: data.contractId })
    return NextResponse.json(
      { success: false, error: 'Failed to send contract' },
      { status: 500 }
    )
  }

  // Send email notification to client
  if (contract?.client_email) {
    try {
      const signatureLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://kazi.app'}/contracts/sign/${data.contractId}`

      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/notifications/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contract',
          data: {
            recipientEmail: contract.client_email,
            recipientName: contract.client_name || 'Client',
            contractTitle: contract.title,
            eventType: 'signature_required',
            senderName: 'Your Freelancer',
            message: data.message || 'Please review and sign this contract at your earliest convenience.',
            actionUrl: signatureLink,
            actionText: 'Review & Sign Contract',
            expiresAt: contract.expiration_date
          }
        })
      })
      logger.info('Contract notification email sent', { contractId: data.contractId, clientEmail: contract.client_email })
    } catch (emailError) {
      logger.warn('Failed to send contract notification email', { error: emailError, contractId: data.contractId })
    }
  }

  logger.info('Contract sent', { contractId: data.contractId, userId })

  return NextResponse.json({
    success: true,
    data: contract,
    message: 'Contract sent for signature'
  })
}

async function handleSignContract(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { contractId: string; signature?: string; signedBy: 'client' | 'freelancer' },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.contractId || !data.signedBy) {
    return NextResponse.json(
      { success: false, error: 'Contract ID and signedBy are required' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: {
        contractId: data.contractId,
        [`signed_by_${data.signedBy}`]: true,
        [`${data.signedBy}_signature_date`]: new Date().toISOString()
      },
      message: `Contract signed by ${data.signedBy} (demo mode)`
    })
  }

  const updateData: Record<string, unknown> = {}
  if (data.signedBy === 'client') {
    updateData.signed_by_client = true
    updateData.client_signature_date = new Date().toISOString()
    updateData.client_signature = data.signature || null
  } else {
    updateData.signed_by_freelancer = true
    updateData.freelancer_signature_date = new Date().toISOString()
    updateData.freelancer_signature = data.signature || null
  }

  // Check if both parties have signed
  const { data: currentContract } = await supabase
    .from('contracts')
    .select('signed_by_client, signed_by_freelancer')
    .eq('id', data.contractId)
    .single()

  const willBeFullySigned =
    (data.signedBy === 'client' && currentContract?.signed_by_freelancer) ||
    (data.signedBy === 'freelancer' && currentContract?.signed_by_client)

  if (willBeFullySigned) {
    updateData.status = 'active'
    updateData.terms_accepted = true
    updateData.activated_at = new Date().toISOString()
  }

  const { data: contract, error } = await supabase
    .from('contracts')
    .update(updateData)
    .eq('id', data.contractId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to sign contract', { error, contractId: data.contractId })
    return NextResponse.json(
      { success: false, error: 'Failed to sign contract' },
      { status: 500 }
    )
  }

  logger.info('Contract signed', { contractId: data.contractId, signedBy: data.signedBy })

  return NextResponse.json({
    success: true,
    data: contract,
    message: willBeFullySigned ? 'Contract is now active' : `Contract signed by ${data.signedBy}`
  })
}

async function handleApproveMilestone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { contractId: string; milestoneId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.contractId || !data.milestoneId) {
    return NextResponse.json(
      { success: false, error: 'Contract ID and milestone ID are required' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: { milestoneId: data.milestoneId, status: 'approved', approved_at: new Date().toISOString() },
      message: 'Milestone approved (demo mode)'
    })
  }

  const { data: milestone, error } = await supabase
    .from('contract_milestones')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: userId
    })
    .eq('id', data.milestoneId)
    .eq('contract_id', data.contractId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to approve milestone', { error, milestoneId: data.milestoneId })
    return NextResponse.json(
      { success: false, error: 'Failed to approve milestone' },
      { status: 500 }
    )
  }

  logger.info('Milestone approved', { milestoneId: data.milestoneId, contractId: data.contractId })

  return NextResponse.json({
    success: true,
    data: milestone,
    message: 'Milestone approved'
  })
}

async function handleCompleteMilestone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { contractId: string; milestoneId: string; notes?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.contractId || !data.milestoneId) {
    return NextResponse.json(
      { success: false, error: 'Contract ID and milestone ID are required' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: { milestoneId: data.milestoneId, status: 'completed', completed_at: new Date().toISOString() },
      message: 'Milestone marked as completed (demo mode)'
    })
  }

  const { data: milestone, error } = await supabase
    .from('contract_milestones')
    .update({
      status: 'completed',
      completed_date: new Date().toISOString(),
      completion_notes: data.notes || null
    })
    .eq('id', data.milestoneId)
    .eq('contract_id', data.contractId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to complete milestone', { error, milestoneId: data.milestoneId })
    return NextResponse.json(
      { success: false, error: 'Failed to complete milestone' },
      { status: 500 }
    )
  }

  // Check if all milestones are completed
  const { data: allMilestones } = await supabase
    .from('contract_milestones')
    .select('status')
    .eq('contract_id', data.contractId)

  const allCompleted = allMilestones?.every(m => m.status === 'completed' || m.status === 'approved')

  if (allCompleted) {
    await supabase
      .from('contracts')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', data.contractId)
  }

  logger.info('Milestone completed', { milestoneId: data.milestoneId, allCompleted })

  return NextResponse.json({
    success: true,
    data: milestone,
    message: allCompleted ? 'Milestone completed. Contract is now complete!' : 'Milestone marked as completed'
  })
}

async function handleAddMilestone(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { contractId: string; milestone: ContractMilestone },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.contractId || !data.milestone?.name || !data.milestone?.value) {
    return NextResponse.json(
      { success: false, error: 'Contract ID, milestone name, and value are required' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: { id: randomBytes(8).toString('hex'), ...data.milestone, status: 'pending', created_at: new Date().toISOString() },
      message: 'Milestone added (demo mode)'
    })
  }

  // Get current milestone count for ordering
  const { count } = await supabase
    .from('contract_milestones')
    .select('id', { count: 'exact' })
    .eq('contract_id', data.contractId)

  const { data: milestone, error } = await supabase
    .from('contract_milestones')
    .insert({
      contract_id: data.contractId,
      name: data.milestone.name,
      description: data.milestone.description || null,
      value: data.milestone.value,
      status: 'pending',
      due_date: data.milestone.due_date || null,
      order_index: (count || 0) + 1
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to add milestone', { error, contractId: data.contractId })
    return NextResponse.json(
      { success: false, error: 'Failed to add milestone' },
      { status: 500 }
    )
  }

  // Update contract value
  await supabase.rpc('update_contract_value', { contract_uuid: data.contractId }).catch(() => {
    // Fallback: manually update
    supabase
      .from('contracts')
      .update({ value: supabase.rpc('sum_milestones', { contract_uuid: data.contractId }) })
      .eq('id', data.contractId)
  })

  logger.info('Milestone added', { milestoneId: milestone.id, contractId: data.contractId })

  return NextResponse.json({
    success: true,
    data: milestone,
    message: 'Milestone added successfully'
  })
}

async function handleTerminateContract(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { contractId: string; reason: string; effectiveDate?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.contractId || !data.reason) {
    return NextResponse.json(
      { success: false, error: 'Contract ID and reason are required' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: { contractId: data.contractId, status: 'cancelled', terminated_at: new Date().toISOString() },
      message: 'Contract terminated (demo mode)'
    })
  }

  const { data: contract, error } = await supabase
    .from('contracts')
    .update({
      status: 'cancelled',
      terminated_at: data.effectiveDate || new Date().toISOString(),
      termination_reason: data.reason
    })
    .eq('id', data.contractId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to terminate contract', { error, contractId: data.contractId })
    return NextResponse.json(
      { success: false, error: 'Failed to terminate contract' },
      { status: 500 }
    )
  }

  logger.info('Contract terminated', { contractId: data.contractId, reason: data.reason })

  return NextResponse.json({
    success: true,
    data: contract,
    message: 'Contract terminated'
  })
}

async function handleRenewContract(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { contractId: string; newEndDate: string; adjustedValue?: number },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.contractId || !data.newEndDate) {
    return NextResponse.json(
      { success: false, error: 'Contract ID and new end date are required' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: { contractId: data.contractId, end_date: data.newEndDate, renewed_at: new Date().toISOString() },
      message: 'Contract renewed (demo mode)'
    })
  }

  const updateData: Record<string, unknown> = {
    end_date: data.newEndDate,
    renewed_at: new Date().toISOString(),
    status: 'active'
  }

  if (data.adjustedValue) {
    updateData.value = data.adjustedValue
  }

  const { data: contract, error } = await supabase
    .from('contracts')
    .update(updateData)
    .eq('id', data.contractId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to renew contract', { error, contractId: data.contractId })
    return NextResponse.json(
      { success: false, error: 'Failed to renew contract' },
      { status: 500 }
    )
  }

  logger.info('Contract renewed', { contractId: data.contractId, newEndDate: data.newEndDate })

  return NextResponse.json({
    success: true,
    data: contract,
    message: 'Contract renewed successfully'
  })
}

async function handleDuplicateContract(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { contractId: string; newTitle?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.contractId) {
    return NextResponse.json(
      { success: false, error: 'Contract ID is required' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    const originalContract = demoContracts.find(c => c.id === data.contractId)
    return NextResponse.json({
      success: true,
      demo: true,
      data: {
        id: `contract-${randomBytes(8).toString('hex')}`,
        ...originalContract,
        title: data.newTitle || `Copy of ${originalContract?.title}`,
        status: 'draft',
        created_at: new Date().toISOString()
      },
      message: 'Contract duplicated (demo mode)'
    })
  }

  // Get original contract
  const { data: original, error: fetchError } = await supabase
    .from('contracts')
    .select('*, milestones:contract_milestones(*)')
    .eq('id', data.contractId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !original) {
    return NextResponse.json(
      { success: false, error: 'Contract not found' },
      { status: 404 }
    )
  }

  // Create duplicate
  const { id: _id, milestones, created_at: _created_at, updated_at: _updated_at, ...contractData } = original
  const { data: newContract, error } = await supabase
    .from('contracts')
    .insert({
      ...contractData,
      title: data.newTitle || `Copy of ${original.title}`,
      status: 'draft',
      signed_by_client: false,
      signed_by_freelancer: false,
      terms_accepted: false
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to duplicate contract', { error, contractId: data.contractId })
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate contract' },
      { status: 500 }
    )
  }

  // Duplicate milestones
  if (milestones && milestones.length > 0) {
    const milestoneInserts = milestones.map((m: ContractMilestone & { order_index?: number }) => ({
      contract_id: newContract.id,
      name: m.name,
      description: m.description,
      value: m.value,
      status: 'pending',
      due_date: m.due_date,
      order_index: m.order_index
    }))

    await supabase.from('contract_milestones').insert(milestoneInserts)
  }

  logger.info('Contract duplicated', { originalId: data.contractId, newId: newContract.id })

  return NextResponse.json({
    success: true,
    data: newContract,
    message: 'Contract duplicated successfully'
  })
}

async function handleCreateFromTemplate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { templateId: string; clientId?: string; clientName?: string; customizations?: Record<string, unknown> },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.templateId) {
    return NextResponse.json(
      { success: false, error: 'Template ID is required' },
      { status: 400 }
    )
  }

  if (demoMode || userId === DEMO_USER_ID) {
    return NextResponse.json({
      success: true,
      demo: true,
      data: {
        id: `contract-${randomBytes(8).toString('hex')}`,
        title: 'New Contract from Template',
        client_name: data.clientName || 'New Client',
        status: 'draft',
        ...data.customizations,
        created_at: new Date().toISOString()
      },
      message: 'Contract created from template (demo mode)'
    })
  }

  // Get template
  const { data: template, error: templateError } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('id', data.templateId)
    .single()

  if (templateError || !template) {
    return NextResponse.json(
      { success: false, error: 'Template not found' },
      { status: 404 }
    )
  }

  // Create contract from template
  const { data: contract, error } = await supabase
    .from('contracts')
    .insert({
      user_id: userId,
      title: template.title,
      client_id: data.clientId || null,
      client_name: data.clientName || null,
      description: template.description,
      scope: template.scope,
      terms: template.terms,
      payment_terms: template.payment_terms,
      status: 'draft',
      ...data.customizations
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to create from template', { error, templateId: data.templateId })
    return NextResponse.json(
      { success: false, error: 'Failed to create contract from template' },
      { status: 500 }
    )
  }

  logger.info('Contract created from template', { contractId: contract.id, templateId: data.templateId })

  return NextResponse.json({
    success: true,
    data: contract,
    message: 'Contract created from template'
  })
}

// ========================================================================
// PATCH - Partial update contract
// ========================================================================
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)

    // Get contract ID from searchParams or body
    let contractId = url.searchParams.get('id')

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))

    // Allow contractId from body if not in searchParams
    if (!contractId && body.contractId) {
      contractId = body.contractId
    }
    if (!contractId && body.id) {
      contractId = body.id
    }

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required (via query param ?id= or in request body)' },
        { status: 400 }
      )
    }

    // Extract update data (excluding id fields)
    const { contractId: _cid, id: _id, ...updateData } = body

    // Allowed fields to update via PATCH
    const allowedFields = [
      'title', 'description', 'scope', 'value', 'currency',
      'start_date', 'end_date', 'payment_terms', 'payment_schedule', 'terms',
      'client_id', 'client_name', 'client_email', 'status'
    ]
    const sanitizedUpdate: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedUpdate[field] = updateData[field]
      }
    }

    if (Object.keys(sanitizedUpdate).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Add updated_at timestamp
    sanitizedUpdate.updated_at = new Date().toISOString()

    // Demo mode response
    if (demoMode || effectiveUserId === DEMO_USER_ID) {
      const demoContract = demoContracts.find(c => c.id === contractId)
      if (!demoContract) {
        return NextResponse.json(
          { success: false, error: 'Contract not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          ...demoContract,
          ...sanitizedUpdate,
          id: contractId
        },
        message: 'Contract updated (demo mode)'
      })
    }

    // Update contract in database
    const { data: contract, error } = await supabase
      .from('contracts')
      .update(sanitizedUpdate)
      .eq('id', contractId)
      .eq('user_id', effectiveUserId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update contract', { error, contractId })
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Contract not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to update contract' },
        { status: 500 }
      )
    }

    logger.info('Contract updated via PATCH', { contractId, fields: Object.keys(sanitizedUpdate) })

    return NextResponse.json({
      success: true,
      data: contract,
      message: 'Contract updated successfully'
    })
  } catch (error) {
    logger.error('Contracts PATCH error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to update contract' },
      { status: 500 }
    )
  }
}

// ========================================================================
// PUT - Update contract
// ========================================================================
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { contractId, ...updateData } = body

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 }
      )
    }

    // Allowed fields to update
    const allowedFields = [
      'title', 'description', 'scope', 'value', 'currency',
      'start_date', 'end_date', 'payment_terms', 'payment_schedule', 'terms'
    ]
    const sanitizedUpdate: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedUpdate[field] = updateData[field]
      }
    }

    if (Object.keys(sanitizedUpdate).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    if (demoMode || effectiveUserId === DEMO_USER_ID) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { contractId, ...sanitizedUpdate, updated_at: new Date().toISOString() },
        message: 'Contract updated (demo mode)'
      })
    }

    const { data: contract, error } = await supabase
      .from('contracts')
      .update(sanitizedUpdate)
      .eq('id', contractId)
      .eq('user_id', effectiveUserId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update contract', { error, contractId })
      return NextResponse.json(
        { success: false, error: 'Failed to update contract' },
        { status: 500 }
      )
    }

    logger.info('Contract updated', { contractId, fields: Object.keys(sanitizedUpdate) })

    return NextResponse.json({
      success: true,
      data: contract,
      message: 'Contract updated successfully'
    })
  } catch (error) {
    logger.error('Contracts PUT error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to update contract' },
      { status: 500 }
    )
  }
}

// ========================================================================
// DELETE - Delete contract
// ========================================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const contractId = url.searchParams.get('id')

    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID is required' },
        { status: 400 }
      )
    }

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (demoMode || effectiveUserId === DEMO_USER_ID) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { contractId, deleted_at: new Date().toISOString() },
        message: 'Contract deleted (demo mode)'
      })
    }

    // Check if contract can be deleted (only drafts or cancelled)
    const { data: contract } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', contractId)
      .eq('user_id', effectiveUserId)
      .single()

    if (contract && !['draft', 'cancelled'].includes(contract.status)) {
      return NextResponse.json(
        { success: false, error: 'Only draft or cancelled contracts can be deleted' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', contractId)
      .eq('user_id', effectiveUserId)

    if (error) {
      logger.error('Failed to delete contract', { error, contractId })
      return NextResponse.json(
        { success: false, error: 'Failed to delete contract' },
        { status: 500 }
      )
    }

    logger.info('Contract deleted', { contractId, userId: effectiveUserId })

    return NextResponse.json({
      success: true,
      data: { contractId, deleted_at: new Date().toISOString() },
      message: 'Contract deleted successfully'
    })
  } catch (error) {
    logger.error('Contracts DELETE error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to delete contract' },
      { status: 500 }
    )
  }
}

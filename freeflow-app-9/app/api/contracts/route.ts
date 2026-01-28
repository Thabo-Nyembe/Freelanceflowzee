import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

// Sample contracts data for investor demos
const demoContracts = [
  {
    id: 'contract-001',
    title: 'Enterprise Software Development Agreement',
    client_name: 'TechCorp Industries',
    status: 'active',
    value: 125000,
    start_date: '2024-01-15',
    end_date: '2024-12-31',
    description: 'Full-stack development services for enterprise platform',
    payment_terms: 'Net 30',
    milestones: [
      { name: 'Phase 1: Discovery', value: 25000, status: 'completed' },
      { name: 'Phase 2: Development', value: 75000, status: 'in_progress' },
      { name: 'Phase 3: Deployment', value: 25000, status: 'pending' }
    ]
  },
  {
    id: 'contract-002',
    title: 'Brand Identity & Marketing Package',
    client_name: 'GreenEarth Ventures',
    status: 'active',
    value: 45000,
    start_date: '2024-02-01',
    end_date: '2024-06-30',
    description: 'Complete brand refresh including logo, guidelines, and marketing collateral',
    payment_terms: 'Net 15',
    milestones: [
      { name: 'Brand Discovery', value: 10000, status: 'completed' },
      { name: 'Design Development', value: 25000, status: 'completed' },
      { name: 'Final Delivery', value: 10000, status: 'in_progress' }
    ]
  },
  {
    id: 'contract-003',
    title: 'Mobile App Maintenance Retainer',
    client_name: 'HealthFirst Medical',
    status: 'active',
    value: 8500,
    start_date: '2024-03-01',
    end_date: '2025-02-28',
    description: 'Monthly retainer for iOS and Android app maintenance and updates',
    payment_terms: 'Monthly',
    milestones: []
  },
  {
    id: 'contract-004',
    title: 'E-commerce Platform Build',
    client_name: 'Artisan Collective',
    status: 'pending_signature',
    value: 78000,
    start_date: '2024-04-15',
    end_date: '2024-09-30',
    description: 'Custom e-commerce platform with inventory management and payment processing',
    payment_terms: 'Net 30',
    milestones: [
      { name: 'Platform Setup', value: 20000, status: 'pending' },
      { name: 'Feature Development', value: 40000, status: 'pending' },
      { name: 'Launch & Training', value: 18000, status: 'pending' }
    ]
  },
  {
    id: 'contract-005',
    title: 'Video Production Series',
    client_name: 'EduLearn Academy',
    status: 'completed',
    value: 35000,
    start_date: '2023-10-01',
    end_date: '2024-01-31',
    description: '20-episode educational video series with animations and graphics',
    payment_terms: 'Net 30',
    milestones: [
      { name: 'Pre-production', value: 7000, status: 'completed' },
      { name: 'Production', value: 20000, status: 'completed' },
      { name: 'Post-production', value: 8000, status: 'completed' }
    ]
  },
  {
    id: 'contract-006',
    title: 'UI/UX Design Sprint',
    client_name: 'FinanceFlow Inc',
    status: 'active',
    value: 28000,
    start_date: '2024-03-10',
    end_date: '2024-05-10',
    description: 'Design sprint for financial dashboard redesign with user testing',
    payment_terms: 'Milestone-based',
    milestones: [
      { name: 'Research & Analysis', value: 6000, status: 'completed' },
      { name: 'Design Concepts', value: 12000, status: 'in_progress' },
      { name: 'Final Designs & Handoff', value: 10000, status: 'pending' }
    ]
  },
  {
    id: 'contract-007',
    title: 'Annual SEO & Content Strategy',
    client_name: 'LocalBiz Solutions',
    status: 'expired',
    value: 24000,
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    description: 'Comprehensive SEO audit, content strategy, and monthly optimization',
    payment_terms: 'Monthly',
    milestones: []
  },
  {
    id: 'contract-008',
    title: 'API Integration Project',
    client_name: 'DataSync Partners',
    status: 'active',
    value: 52000,
    start_date: '2024-02-15',
    end_date: '2024-07-15',
    description: 'Custom API development and third-party integrations',
    payment_terms: 'Net 45',
    milestones: [
      { name: 'Architecture & Planning', value: 8000, status: 'completed' },
      { name: 'Core API Development', value: 28000, status: 'in_progress' },
      { name: 'Integration & Testing', value: 16000, status: 'pending' }
    ]
  }
]

export async function GET(request: NextRequest) {
  try {
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    // Always return demo data for demo mode (no auth required)
    if (demoMode) {
      let filteredContracts = demoContracts

      if (status && status !== 'all') {
        filteredContracts = demoContracts.filter(c => c.status === status)
      }

      // Calculate stats
      const totalValue = demoContracts.reduce((sum, c) => sum + c.value, 0)
      const activeValue = demoContracts
        .filter(c => c.status === 'active')
        .reduce((sum, c) => sum + c.value, 0)
      const completedValue = demoContracts
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + c.value, 0)

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

    // For non-demo mode, try to get real data from Supabase
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized', success: false },
          { status: 401 }
        )
      }

      let query = supabase
        .from('contracts')
        .select('*')
        .eq('user_id', user.id)

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      return NextResponse.json({
        success: true,
        data: {
          contracts: data || [],
          stats: {
            total_contracts: data?.length || 0
          }
        }
      })
    } catch {
      // If Supabase fails, return empty data
      return NextResponse.json({
        success: true,
        data: {
          contracts: [],
          stats: {
            total_contracts: 0
          }
        }
      })
    }
  } catch (error) {
    console.error('Contracts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const demoMode = isDemoMode(request)
    const body = await request.json()

    if (demoMode) {
      // In demo mode, return a mock created contract
      const newContract = {
        id: `contract-${Date.now()}`,
        ...body,
        status: 'pending_signature',
        created_at: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: newContract,
        message: 'Contract created successfully (demo mode)'
      })
    }

    // For non-demo mode, would create in Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        user_id: user.id,
        ...body,
        status: 'pending_signature'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      message: 'Contract created successfully'
    })
  } catch (error) {
    console.error('Contracts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    )
  }
}

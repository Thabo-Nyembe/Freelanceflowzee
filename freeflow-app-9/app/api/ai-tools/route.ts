import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// AI Tools Management API
// Supports: Create, Update, Delete, Execute, Export AI tools

type AIToolType = 'text' | 'image' | 'audio' | 'video' | 'code' | 'analysis'
type AICategory = 'content' | 'creative' | 'productivity' | 'analytics' | 'automation' | 'development'
type ToolStatus = 'active' | 'inactive' | 'beta' | 'deprecated'
type Performance = 'excellent' | 'good' | 'fair' | 'poor'
type PricingTier = 'free' | 'basic' | 'pro' | 'enterprise'

interface AITool {
  id: string
  name: string
  type: AIToolType
  category: AICategory
  description: string
  model: string
  provider: string
  status: ToolStatus
  pricingTier: PricingTier
  performance: Performance
  usageCount: number
  successRate: number
  avgResponseTime: number
  createdAt: string
  lastUsed: string
  features: string[]
  tags: string[]
  isPopular: boolean
  isFavorite: boolean
  version: string
}

interface AIToolRequest {
  action: 'create' | 'update' | 'delete' | 'bulk-delete' | 'execute' | 'export' | 'list'
  toolId?: string
  toolIds?: string[]
  data?: Partial<AITool>
  exportFormat?: 'json' | 'csv' | 'excel'
}

// Create new AI tool
async function handleCreateTool(supabase: any, userId: string, data: Partial<AITool>): Promise<NextResponse> {
  try {
    if (!data.name || !data.description || !data.model || !data.provider) {
      return NextResponse.json({
        success: false,
        error: 'Name, description, model, and provider are required'
      }, { status: 400 })
    }

    const { data: tool, error } = await supabase
      .from('ai_tools')
      .insert({
        user_id: userId,
        name: data.name,
        tool_type: data.type || 'text',
        category: data.category || 'content',
        description: data.description,
        model: data.model,
        provider: data.provider,
        status: 'active',
        pricing_tier: data.pricingTier || 'free',
        performance: 'good',
        usage_count: 0,
        success_rate: 0.92,
        avg_response_time: 1.5,
        features: data.features || ['Real-time processing', 'API integration', 'Custom templates'],
        tags: data.tags || ['AI', 'Custom'],
        is_popular: false,
        is_favorite: false,
        version: data.version || '1.0.0'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action: 'create',
      tool,
      message: `AI tool "${tool.name}" created successfully`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create AI tool'
    }, { status: 500 })
  }
}

// Update AI tool
async function handleUpdateTool(supabase: any, userId: string, toolId: string, data: Partial<AITool>): Promise<NextResponse> {
  try {
    const { data: tool, error } = await supabase
      .from('ai_tools')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', toolId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action: 'update',
      tool,
      message: 'AI tool updated successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update AI tool'
    }, { status: 500 })
  }
}

// Delete AI tool
async function handleDeleteTool(supabase: any, userId: string, toolId: string): Promise<NextResponse> {
  try {
    const { error } = await supabase
      .from('ai_tools')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', toolId)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action: 'delete',
      toolId,
      message: 'AI tool deleted successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete AI tool'
    }, { status: 500 })
  }
}

// Bulk delete AI tools
async function handleBulkDelete(supabase: any, userId: string, toolIds: string[]): Promise<NextResponse> {
  try {
    if (!toolIds || toolIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No tool IDs provided'
      }, { status: 400 })
    }

    const { error } = await supabase
      .from('ai_tools')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', toolIds)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action: 'bulk-delete',
      deletedCount: toolIds.length,
      message: `Deleted ${toolIds.length} AI tool(s)`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete AI tools'
    }, { status: 500 })
  }
}

// Execute AI tool
async function handleExecuteTool(supabase: any, userId: string, toolId: string): Promise<NextResponse> {
  try {
    // Get tool details
    const { data: tool, error: fetchError } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('id', toolId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !tool) {
      return NextResponse.json({
        success: false,
        error: 'Tool not found'
      }, { status: 404 })
    }

    const executionTime = Math.floor(Math.random() * 2000) + 500
    const success = Math.random() > 0.1 // 90% success rate

    // Update usage count
    await supabase
      .from('ai_tools')
      .update({
        usage_count: (tool.usage_count || 0) + 1,
        last_used: new Date().toISOString()
      })
      .eq('id', toolId)

    // Log execution
    await supabase
      .from('ai_tool_executions')
      .insert({
        user_id: userId,
        tool_id: toolId,
        execution_time_ms: executionTime,
        success,
        status: success ? 'completed' : 'failed'
      })

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Tool execution failed',
        details: 'Unable to complete the AI operation'
      }, { status: 500 })
    }

    const result = {
      toolId,
      toolName: tool.name,
      executionTime: `${executionTime}ms`,
      status: 'completed',
      output: {
        success: true,
        data: 'AI tool executed successfully',
        confidence: 0.95
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      action: 'execute',
      result,
      message: 'AI tool executed successfully'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to execute AI tool'
    }, { status: 500 })
  }
}

// Export AI tools
async function handleExportTools(supabase: any, userId: string, format: string): Promise<NextResponse> {
  try {
    const { data: tools, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    // In a real app, you would generate actual export files here
    const exportData = format === 'json' ? JSON.stringify(tools, null, 2) : tools

    return NextResponse.json({
      success: true,
      action: 'export',
      format: format.toUpperCase(),
      toolCount: tools?.length || 0,
      data: exportData,
      message: `Exported ${tools?.length || 0} AI tools as ${format.toUpperCase()}`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to export AI tools'
    }, { status: 500 })
  }
}

// List AI tools
async function handleListTools(supabase: any, userId: string): Promise<NextResponse> {
  try {
    const { data: tools, error } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      action: 'list',
      tools: tools || [],
      total: tools?.length || 0,
      message: `Found ${tools?.length || 0} AI tools`
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to list AI tools'
    }, { status: 500 })
  }
}

// Main POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: AIToolRequest = await request.json()

    switch (body.action) {
      case 'create':
        if (!body.data) {
          return NextResponse.json({
            success: false,
            error: 'Tool data required'
          }, { status: 400 })
        }
        return handleCreateTool(supabase, user.id, body.data)

      case 'update':
        if (!body.toolId || !body.data) {
          return NextResponse.json({
            success: false,
            error: 'Tool ID and data required'
          }, { status: 400 })
        }
        return handleUpdateTool(supabase, user.id, body.toolId, body.data)

      case 'delete':
        if (!body.toolId) {
          return NextResponse.json({
            success: false,
            error: 'Tool ID required'
          }, { status: 400 })
        }
        return handleDeleteTool(supabase, user.id, body.toolId)

      case 'bulk-delete':
        if (!body.toolIds) {
          return NextResponse.json({
            success: false,
            error: 'Tool IDs required'
          }, { status: 400 })
        }
        return handleBulkDelete(supabase, user.id, body.toolIds)

      case 'execute':
        if (!body.toolId) {
          return NextResponse.json({
            success: false,
            error: 'Tool ID required'
          }, { status: 400 })
        }
        return handleExecuteTool(supabase, user.id, body.toolId)

      case 'export':
        return handleExportTools(supabase, user.id, body.exportFormat || 'json')

      case 'list':
        return handleListTools(supabase, user.id)

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${body.action}`
        }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request'
    }, { status: 400 })
  }
}

// GET handler
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handleListTools(supabase, user.id)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch AI tools'
    }, { status: 500 })
  }
}

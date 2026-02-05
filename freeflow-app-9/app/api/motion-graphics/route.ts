/**
 * Motion Graphics API Routes
 *
 * REST endpoints for Motion Graphics:
 * GET - List projects, layers, animations, exports, stats
 * POST - Create project, layer, animation, export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('motion-graphics')
import {
  getMotionProjects,
  createMotionProject,
  getMotionLayers,
  createMotionLayer,
  getMotionAnimations,
  createMotionAnimation,
  getMotionExports,
  createMotionExport,
  getMotionStats
} from '@/lib/motion-graphics-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'projects'
    const isPublic = searchParams.get('is_public')
    const projectId = searchParams.get('project_id') || undefined
    const layerId = searchParams.get('layer_id') || undefined

    switch (type) {
      case 'projects': {
        const { data, error } = await getMotionProjects(user.id, {
          is_public: isPublic ? isPublic === 'true' : undefined
        })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'layers': {
        if (!projectId) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const { data, error } = await getMotionLayers(projectId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'animations': {
        if (!layerId) {
          return NextResponse.json({ error: 'layer_id required' }, { status: 400 })
        }
        const { data, error } = await getMotionAnimations(layerId)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'exports': {
        const { data, error } = await getMotionExports(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'stats': {
        const { data, error } = await getMotionStats(user.id)
        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Motion Graphics data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Motion Graphics data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-project': {
        const { data, error } = await createMotionProject(user.id, payload)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-layer': {
        const { project_id, ...layerData } = payload
        if (!project_id) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const { data, error } = await createMotionLayer(project_id, layerData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-animation': {
        const { layer_id, ...animationData } = payload
        if (!layer_id) {
          return NextResponse.json({ error: 'layer_id required' }, { status: 400 })
        }
        const { data, error } = await createMotionAnimation(layer_id, animationData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-export': {
        const { project_id, ...exportData } = payload
        if (!project_id) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const { data, error } = await createMotionExport(project_id, user.id, exportData)
        if (error) throw error
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Motion Graphics request', { error })
    return NextResponse.json(
      { error: 'Failed to process Motion Graphics request' },
      { status: 500 }
    )
  }
}

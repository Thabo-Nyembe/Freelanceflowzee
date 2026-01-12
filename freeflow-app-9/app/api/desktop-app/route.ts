/**
 * Desktop App API Routes
 *
 * REST endpoints for Desktop App Management:
 * GET - List projects, builds, distributions, frameworks, analytics, stats
 * POST - Create project, build, distribution, track event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getProjectsByUser,
  createProject,
  getProjectsByOS,
  getProjectsByFramework,
  getArchivedProjects,
  getProjectTemplates,
  getBuildsByUser,
  getBuildsByProject,
  createBuild,
  getBuildsByStatus,
  getBuildsByType,
  getSuccessfulBuilds,
  getSignedBuilds,
  getDistributionsByUser,
  getDistributionsByBuild,
  createDistribution,
  getDistributionsByChannel,
  getActiveDistributions,
  getAllFrameworks,
  getRecommendedFrameworks,
  getMostUsedFrameworks,
  getFrameworksByOS,
  trackEvent,
  getAnalyticsByProject,
  getDesktopAppStats,
  getProjectStats,
  getBuildStats,
  getDistributionStats
} from '@/lib/desktop-app-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'projects'
    const os = searchParams.get('os') as any
    const framework = searchParams.get('framework') as any
    const status = searchParams.get('status') || undefined
    const buildType = searchParams.get('build_type') as any
    const channel = searchParams.get('channel') as any
    const projectId = searchParams.get('project_id') || undefined
    const buildId = searchParams.get('build_id') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')

    switch (type) {
      case 'projects': {
        let data
        if (os) {
          data = await getProjectsByOS(user.id, os)
        } else if (framework) {
          data = await getProjectsByFramework(user.id, framework)
        } else {
          data = await getProjectsByUser(user.id)
        }
        return NextResponse.json({ data })
      }

      case 'archived-projects': {
        const data = await getArchivedProjects(user.id)
        return NextResponse.json({ data })
      }

      case 'project-templates': {
        const data = await getProjectTemplates(user.id)
        return NextResponse.json({ data })
      }

      case 'builds': {
        let data
        if (projectId) {
          data = await getBuildsByProject(projectId)
        } else if (status) {
          data = await getBuildsByStatus(user.id, status)
        } else if (buildType) {
          data = await getBuildsByType(user.id, buildType)
        } else {
          data = await getBuildsByUser(user.id)
        }
        return NextResponse.json({ data })
      }

      case 'successful-builds': {
        if (!projectId) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const data = await getSuccessfulBuilds(projectId)
        return NextResponse.json({ data })
      }

      case 'signed-builds': {
        const data = await getSignedBuilds(user.id)
        return NextResponse.json({ data })
      }

      case 'distributions': {
        let data
        if (buildId) {
          data = await getDistributionsByBuild(buildId)
        } else if (channel) {
          data = await getDistributionsByChannel(user.id, channel)
        } else {
          data = await getDistributionsByUser(user.id)
        }
        return NextResponse.json({ data })
      }

      case 'active-distributions': {
        const data = await getActiveDistributions(user.id)
        return NextResponse.json({ data })
      }

      case 'frameworks': {
        let data
        if (os) {
          data = await getFrameworksByOS(os)
        } else {
          data = await getAllFrameworks()
        }
        return NextResponse.json({ data })
      }

      case 'recommended-frameworks': {
        const data = await getRecommendedFrameworks()
        return NextResponse.json({ data })
      }

      case 'popular-frameworks': {
        const data = await getMostUsedFrameworks(limit)
        return NextResponse.json({ data })
      }

      case 'analytics': {
        if (!projectId) {
          return NextResponse.json({ error: 'project_id required' }, { status: 400 })
        }
        const data = await getAnalyticsByProject(projectId, limit)
        return NextResponse.json({ data })
      }

      case 'stats': {
        const data = await getDesktopAppStats(user.id)
        return NextResponse.json({ data })
      }

      case 'project-stats': {
        const data = await getProjectStats(user.id)
        return NextResponse.json({ data })
      }

      case 'build-stats': {
        const data = await getBuildStats(user.id)
        return NextResponse.json({ data })
      }

      case 'distribution-stats': {
        const data = await getDistributionStats(user.id)
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Desktop App API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Desktop App data' },
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
        const data = await createProject(user.id, payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-build': {
        const data = await createBuild(user.id, payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'create-distribution': {
        const data = await createDistribution(user.id, payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      case 'track-event': {
        const data = await trackEvent(user.id, payload)
        return NextResponse.json({ data }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Desktop App API error:', error)
    return NextResponse.json(
      { error: 'Failed to process Desktop App request' },
      { status: 500 }
    )
  }
}

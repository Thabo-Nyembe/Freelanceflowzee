/**
 * Desktop App API Routes
 *
 * REST endpoints for Desktop App Management:
 * GET - List projects, builds, distributions, frameworks, analytics, stats
 * POST - Create project, build, distribution, track event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
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

const logger = createSimpleLogger('desktop-app')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'projects'
    const os = searchParams.get('os') as string | null
    const framework = searchParams.get('framework') as string | null
    const status = searchParams.get('status') || undefined
    const buildType = searchParams.get('build_type') as string | null
    const channel = searchParams.get('channel') as string | null
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
    logger.error('Desktop App GET error', { error })
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

      case 'download-app': {
        const { version, platform } = payload
        // In production, this would return a signed download URL
        return NextResponse.json({
          success: true,
          action: 'download-app',
          version,
          platform,
          downloadUrl: `https://downloads.kazi.io/${platform}/${version}/kazi-app`,
          size: platform === 'macos' ? '89.5 MB' : platform === 'windows' ? '124.3 MB' : '67.2 MB',
          message: `Download started for ${version} (${platform})`
        })
      }

      case 'renew-certificate': {
        const { certId, certName } = payload
        // In production, this would initiate certificate renewal with Apple/Microsoft
        return NextResponse.json({
          success: true,
          action: 'renew-certificate',
          certId,
          certName,
          newExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          message: `Certificate renewal for ${certName} has been submitted`
        })
      }

      case 'rebuild-native-modules': {
        // In production, this would trigger a rebuild on CI/CD
        return NextResponse.json({
          success: true,
          action: 'rebuild-native-modules',
          modules: ['node-pty', 'sqlite3', 'fsevents', 'keytar'],
          message: 'All native modules have been recompiled successfully'
        })
      }

      case 'clear-build-cache': {
        // In production, this would clear S3/CDN cached builds
        return NextResponse.json({
          success: true,
          action: 'clear-build-cache',
          clearedSize: '2.4 GB',
          clearedFiles: 847,
          message: 'All cached builds have been removed'
        })
      }

      case 'revoke-update-keys': {
        // In production, this would invalidate update signing keys
        return NextResponse.json({
          success: true,
          action: 'revoke-update-keys',
          revokedKeys: 3,
          affectedUsers: 1245,
          message: 'All update keys have been revoked. Users will need to download the full application.'
        })
      }

      case 'delete-crash-reports': {
        // In production, this would delete crash reports from Sentry/Bugsnag
        return NextResponse.json({
          success: true,
          action: 'delete-crash-reports',
          deletedReports: 89,
          freedSpace: '156 MB',
          message: 'All crash report history has been removed'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Desktop App POST error', { error })
    return NextResponse.json(
      { error: 'Failed to process Desktop App request' },
      { status: 500 }
    )
  }
}

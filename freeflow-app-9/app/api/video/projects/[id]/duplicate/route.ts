import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-VideoDuplicate')

/**
 * Duplicate Video Project API
 * Creates a copy of an existing project
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch original project
    const { data: original, error: fetchError } = await supabase
      .from('video_projects')
      .select('*, video_assets(*), timeline_clips(*)')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      logger.error('Failed to fetch project for duplication', { error: fetchError, projectId })
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      )
    }

    // Create duplicate project
    const { data: newProject, error: createError } = await supabase
      .from('video_projects')
      .insert({
        user_id: user.id,
        title: `${original.title} (Copy)`,
        description: original.description,
        status: 'draft',
        resolution: original.resolution,
        fps: original.fps,
        duration: original.duration,
        template: original.template
      })
      .select()
      .single()

    if (createError) {
      logger.error('Failed to create duplicate project', { error: createError, projectId })
      return NextResponse.json(
        { error: 'Failed to create duplicate' },
        { status: 500 }
      )
    }

    // Copy assets
    const assetMap = new Map() // old ID -> new ID
    if (original.video_assets && original.video_assets.length > 0) {
      const assetsToInsert = original.video_assets.map((asset: any) => ({
        project_id: newProject.id,
        type: asset.type,
        name: asset.name,
        url: asset.url,
        duration: asset.duration,
        size: asset.size,
        mime_type: asset.mime_type,
        metadata: asset.metadata
      }))

      const { data: newAssets, error: assetsError } = await supabase
        .from('video_assets')
        .insert(assetsToInsert)
        .select()

      if (assetsError) {
        logger.error('Failed to copy assets', { error: assetsError, projectId })
        // Don't fail the entire operation, just log
      } else if (newAssets) {
        // Map old IDs to new IDs
        original.video_assets.forEach((oldAsset: any, index: number) => {
          assetMap.set(oldAsset.id, newAssets[index].id)
        })
      }
    }

    // Copy timeline clips with updated asset IDs
    if (original.timeline_clips && original.timeline_clips.length > 0 && assetMap.size > 0) {
      const clipsToInsert = original.timeline_clips.map((clip: any) => ({
        project_id: newProject.id,
        asset_id: assetMap.get(clip.asset_id) || clip.asset_id,
        track: clip.track,
        start_time: clip.start_time,
        end_time: clip.end_time,
        trim_start: clip.trim_start,
        trim_end: clip.trim_end,
        effects: clip.effects,
        transitions: clip.transitions,
        position: clip.position
      }))

      const { error: clipsError } = await supabase
        .from('timeline_clips')
        .insert(clipsToInsert)

      if (clipsError) {
        logger.error('Failed to copy timeline clips', { error: clipsError, projectId })
        // Don't fail the entire operation
      }
    }

    logger.info('Project duplicated successfully', {
      originalId: projectId,
      newId: newProject.id,
      userId: user.id,
      assetsCount: assetMap.size,
      clipsCount: original.timeline_clips?.length || 0
    })

    return NextResponse.json({
      success: true,
      project: newProject,
      message: 'Project duplicated successfully'
    }, { status: 201 })

  } catch (error) {
    logger.error('Project duplication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

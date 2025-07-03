/**
 * Video Upload API Route
 * Creates Mux upload URLs and video database records
 * Based on Cap.so's upload flow but integrated with FreeFlow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createDirectUpload } from '@/lib/video/mux-client';
import { validateUploadFile, uploadConfig } from '@/lib/video/config';
import { CreateVideoInput } from '@/lib/video/types';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      fileName, 
      fileSize, 
      fileType, 
      title, 
      description, 
      project_id, 
      tags = [], 
      is_public = false,
      sharing_settings = {
        allowComments: true,
        allowDownload: false,
        trackViews: true
      }
    }: {
      fileName: string;
      fileSize: number;
      fileType: string;
    } & CreateVideoInput = body;

    // Validate file parameters
    const mockFile = new File([''], fileName, { type: fileType });
    Object.defineProperty(mockFile, 'size', { value: fileSize });
    
    const validation = validateUploadFile(mockFile);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File validation failed',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Verify project ownership if project_id is provided
    if (project_id) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, user_id')
        .eq('id', project_id)
        .eq('user_id', user.id)
        .single();

      if (projectError || !project) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid project or insufficient permissions' 
          },
          { status: 403 }
        );
      }
    }

    // Create Mux direct upload
    const corsOrigin = request.headers.get('origin') || '*';
    const passthrough = JSON.stringify({
      user_id: user.id,
      project_id: project_id || null,
      file_name: fileName,
      created_at: new Date().toISOString()
    });

    const muxUpload = await createDirectUpload({
      timeout: uploadConfig.timeout / 1000, // Convert to seconds
      corsOrigin,
      passthrough
    });

    if (!muxUpload.success) {
      console.error('Mux upload creation failed:', muxUpload.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create upload URL',
          details: muxUpload.error 
        },
        { status: 500 }
      );
    }

    // Create video record in database
    const videoData = {
      title: title || fileName.replace(/\.[^/.]+$/, ""), // Remove file extension
      description: description || null,
      owner_id: user.id,
      project_id: project_id || null,
      mux_upload_id: muxUpload.uploadId,
      file_size_bytes: fileSize,
      status: 'uploading' as const,
      processing_progress: 0,
      is_public,
      sharing_settings,
      tags,
      metadata: {
        original_filename: fileName,
        file_type: fileType,
        upload_source: 'web',
        user_agent: request.headers.get('user-agent'),
        created_via: 'api'
      }
    };

    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert(videoData)
      .select()
      .single();

    if (videoError) {
      console.error('Database insert failed:', videoError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create video record',
          details: videoError.message 
        },
        { status: 500 }
      );
    }

    // Return upload information
    return NextResponse.json({
      success: true,
      data: {
        video: {
          id: video.id,
          title: video.title,
          status: video.status,
          project_id: video.project_id
        },
        upload: {
          uploadId: muxUpload.uploadId,
          uploadUrl: muxUpload.uploadUrl,
          timeout: uploadConfig.timeout
        },
        config: {
          maxFileSize: uploadConfig.maxFileSize,
          supportedFormats: uploadConfig.supportedFormats,
          chunkSize: uploadConfig.chunkSize
        }
      },
      message: 'Upload URL created successfully'
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve upload configuration
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        maxFileSize: uploadConfig.maxFileSize,
        supportedFormats: uploadConfig.supportedFormats,
        allowedMimeTypes: uploadConfig.allowedMimeTypes,
        chunkSize: uploadConfig.chunkSize,
        timeout: uploadConfig.timeout
      }
    });
  } catch (error) {
    console.error('Upload config error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve upload configuration' 
      },
      { status: 500 }
    );
  }
} 
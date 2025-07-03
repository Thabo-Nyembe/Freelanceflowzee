import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transcribeVideo, analyzeVideoContent, generateSmartTags, generateVideoChapters } from '@/lib/ai/openai-client';
import { isTranscriptionEnabled, isContentAnalysisEnabled } from '@/lib/ai/config';

interface AIProcessingRequest {
  features?: {
    transcription?: boolean;
    analysis?: boolean;
    tagging?: boolean;
    chapters?: boolean;
  };
  options?: {
    language?: string;
    force?: boolean; // Re-process even if already processed
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: AIProcessingRequest = await request.json();
    const features = body.features || {
      transcription: true,
      analysis: true,
      tagging: true,
      chapters: true
    };

    // Validate video exists and user owns it
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, owner_id, title, description, duration_seconds, mux_asset_id, status, ai_processing_status')
      .eq('id', id)
      .single();

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    if (video.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this video' },
        { status: 403 }
      );
    }

    if (video.status !== 'ready') {
      return NextResponse.json(
        { error: 'Video is not ready for AI processing' },
        { status: 400 }
      );
    }

    // Check if AI services are available
    if (!isTranscriptionEnabled() && features.transcription) {
      return NextResponse.json(
        { error: 'Transcription service not available' },
        { status: 503 }
      );
    }

    if (!isContentAnalysisEnabled() && (features.analysis || features.tagging || features.chapters)) {
      return NextResponse.json(
        { error: 'AI analysis service not available' },
        { status: 503 }
      );
    }

    // Check if already processing (unless force is true)
    if (video.ai_processing_status === 'processing' && !body.options?.force) {
      return NextResponse.json(
        { error: 'AI processing already in progress' },
        { status: 409 }
      );
    }

    // Update video AI processing status
    await supabase
      .from('videos')
      .update({
        ai_processing_status: 'processing',
        ai_processing_started_at: new Date().toISOString()
      })
      .eq('id', id);

    // Start AI processing (this would typically be queued for background processing)
    const processingResults = await processVideoAI(id, video, features, body.options);

    return NextResponse.json({
      success: true,
      videoId: id,
      processing: processingResults
    });

  } catch (error) {
    console.error('Error in AI processing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get video and AI processing status
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, owner_id, ai_processing_status, ai_processing_started_at, ai_processing_completed_at, has_transcription, has_ai_analysis, has_ai_tags, has_ai_chapters')
      .eq('id', id)
      .single();

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    if (video.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this video' },
        { status: 403 }
      );
    }

    // Get AI processing results
    const [transcription, analysis, tags, chapters] = await Promise.all([
      // Get transcription
      supabase
        .from('video_transcriptions')
        .select('id, text, language, duration_seconds, confidence_score, processing_status')
        .eq('video_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      
      // Get AI analysis
      supabase
        .from('video_ai_analysis')
        .select('*')
        .eq('video_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      
      // Get AI tags
      supabase
        .from('video_ai_tags')
        .select('tag, category, confidence_score, source')
        .eq('video_id', id)
        .order('confidence_score', { ascending: false }),
      
      // Get chapters
      supabase
        .from('video_chapters')
        .select('*')
        .eq('video_id', id)
        .order('chapter_order', { ascending: true })
    ]);

    return NextResponse.json({
      videoId: id,
      status: {
        overall: video.ai_processing_status,
        startedAt: video.ai_processing_started_at,
        completedAt: video.ai_processing_completed_at,
        features: {
          transcription: video.has_transcription,
          analysis: video.has_ai_analysis,
          tags: video.has_ai_tags,
          chapters: video.has_ai_chapters
        }
      },
      results: {
        transcription: transcription.data || null,
        analysis: analysis.data || null,
        tags: tags.data || [],
        chapters: chapters.data || []
      }
    });

  } catch (error) {
    console.error('Error getting AI processing status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// AI Processing Implementation
async function processVideoAI(
  videoId: string,
  video: any,
  features: any,
  options: any = {}
) {
  const supabase = await createClient();
  const results: any = {
    transcription: null,
    analysis: null,
    tags: null,
    chapters: null
  };

  try {
    // Step 1: Transcription (if enabled)
    if (features.transcription) {
      console.log(`Starting transcription for video ${videoId}`);
      
      try {
        // In a real implementation, you would:
        // 1. Download audio from Mux asset
        // 2. Convert to supported format if needed
        // 3. Send to OpenAI Whisper
        
        // For now, we'll simulate with a placeholder
        const transcriptionResult = await simulateTranscription(video);
        
        // Save transcription to database
        const { data: savedTranscription, error: transcriptionError } = await supabase
          .from('video_transcriptions')
          .insert({
            video_id: videoId,
            text: transcriptionResult.text,
            language: transcriptionResult.language || 'en',
            duration_seconds: video.duration_seconds,
            confidence_score: 0.95,
            processing_status: 'completed',
            ai_model: 'whisper-1'
          })
          .select()
          .single();

        if (transcriptionError) {
          throw new Error(`Failed to save transcription: ${transcriptionError.message}`);
        }

        results.transcription = savedTranscription;

        // Update video transcription flag
        await supabase
          .from('videos')
          .update({ has_transcription: true })
          .eq('id', videoId);

        console.log(`Transcription completed for video ${videoId}`);

      } catch (error) {
        console.error(`Transcription failed for video ${videoId}:`, error);
        // Save error status
        await supabase
          .from('video_transcriptions')
          .insert({
            video_id: videoId,
            text: '',
            processing_status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          });
      }
    }

    // Step 2: Content Analysis (if enabled and transcription available)
    if (features.analysis && results.transcription) {
      console.log(`Starting content analysis for video ${videoId}`);
      
      try {
        const analysis = await analyzeVideoContent(
          results.transcription.text,
          {
            title: video.title,
            description: video.description,
            duration: video.duration_seconds
          }
        );

        // Save analysis to database
        const { data: savedAnalysis, error: analysisError } = await supabase
          .from('video_ai_analysis')
          .insert({
            video_id: videoId,
            transcription_id: results.transcription.id,
            summary: analysis.summary,
            main_topics: analysis.mainTopics,
            category: analysis.category,
            difficulty: analysis.difficulty,
            target_audience: analysis.targetAudience,
            key_insights: analysis.keyInsights,
            action_items: analysis.actionItems,
            sentiment: analysis.sentiment,
            detected_language: analysis.language,
            estimated_watch_time: analysis.estimatedWatchTime,
            content_type: analysis.contentType,
            processing_status: 'completed',
            confidence_score: 0.90
          })
          .select()
          .single();

        if (analysisError) {
          throw new Error(`Failed to save analysis: ${analysisError.message}`);
        }

        results.analysis = savedAnalysis;

        // Update video analysis flag
        await supabase
          .from('videos')
          .update({ has_ai_analysis: true })
          .eq('id', videoId);

        console.log(`Content analysis completed for video ${videoId}`);

      } catch (error) {
        console.error(`Content analysis failed for video ${videoId}:`, error);
      }
    }

    // Step 3: Smart Tagging (if enabled and transcription available)
    if (features.tagging && results.transcription) {
      console.log(`Starting smart tagging for video ${videoId}`);
      
      try {
        const tags = await generateSmartTags(
          results.transcription.text,
          {
            title: video.title,
            description: video.description,
            category: results.analysis?.category
          }
        );

        // Save tags to database
        const tagInserts = tags.map(tag => ({
          video_id: videoId,
          analysis_id: results.analysis?.id,
          tag,
          source: 'ai_generated',
          confidence_score: 0.85,
          ai_model: 'gpt-3.5-turbo'
        }));

        const { data: savedTags, error: tagsError } = await supabase
          .from('video_ai_tags')
          .insert(tagInserts)
          .select();

        if (tagsError) {
          throw new Error(`Failed to save tags: ${tagsError.message}`);
        }

        results.tags = savedTags;

        // Update video tags flag
        await supabase
          .from('videos')
          .update({ has_ai_tags: true })
          .eq('id', videoId);

        console.log(`Smart tagging completed for video ${videoId}`);

      } catch (error) {
        console.error(`Smart tagging failed for video ${videoId}:`, error);
      }
    }

    // Step 4: Chapter Generation (if enabled and transcription available)
    if (features.chapters && results.transcription && video.duration_seconds > 120) {
      console.log(`Starting chapter generation for video ${videoId}`);
      
      try {
        const chapters = await generateVideoChapters(
          results.transcription.text,
          video.duration_seconds
        );

        // Save chapters to database
        const chapterInserts = chapters.map((chapter, index) => ({
          video_id: videoId,
          transcription_id: results.transcription.id,
          title: chapter.title,
          description: chapter.description,
          start_time: chapter.startTime,
          end_time: chapter.endTime,
          chapter_order: index + 1,
          ai_generated: true,
          ai_model: 'gpt-4-turbo-preview',
          confidence_score: 0.80
        }));

        const { data: savedChapters, error: chaptersError } = await supabase
          .from('video_chapters')
          .insert(chapterInserts)
          .select();

        if (chaptersError) {
          throw new Error(`Failed to save chapters: ${chaptersError.message}`);
        }

        results.chapters = savedChapters;

        // Update video chapters flag
        await supabase
          .from('videos')
          .update({ has_ai_chapters: true })
          .eq('id', videoId);

        console.log(`Chapter generation completed for video ${videoId}`);

      } catch (error) {
        console.error(`Chapter generation failed for video ${videoId}:`, error);
      }
    }

    // Update overall AI processing status
    await supabase
      .from('videos')
      .update({
        ai_processing_status: 'completed',
        ai_processing_completed_at: new Date().toISOString()
      })
      .eq('id', videoId);

    console.log(`AI processing completed for video ${videoId}`);

  } catch (error) {
    console.error(`AI processing failed for video ${videoId}:`, error);
    
    // Update status to failed
    await supabase
      .from('videos')
      .update({
        ai_processing_status: 'failed',
        ai_processing_completed_at: new Date().toISOString()
      })
      .eq('id', videoId);
  }

  return results;
}

// Simulation function for transcription (replace with real implementation)
async function simulateTranscription(video: any) {
  // In a real implementation, this would:
  // 1. Get audio URL from Mux
  // 2. Download/stream audio
  // 3. Call OpenAI Whisper API
  
  // For now, return a simulated transcription
  return {
    text: `This is a simulated transcription for the video "${video.title}". In a real implementation, this would contain the actual transcribed audio content from the video. The transcription would include speaker identification, timestamps, and high accuracy speech-to-text conversion using OpenAI's Whisper model.`,
    language: 'en'
  };
} 
/**
 * Voice Transcription API - FreeFlow A+++ Implementation
 *
 * Comprehensive speech-to-text API with:
 * - OpenAI Whisper transcription
 * - Real-time streaming support
 * - Speaker diarization
 * - Language detection
 * - Subtitle generation
 * - AI-powered insights extraction
 *
 * Beats competitors: Otter.ai, Rev.ai, AssemblyAI, Deepgram
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getTranscriptionService,
  TranscriptionOptions,
  TranscriptionResult
} from '@/lib/whisper/transcription';
import { createSimpleLogger } from '@/lib/simple-logger';
import { nanoid } from 'nanoid';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('API-VoiceTranscription');

// Request types
interface TranscribeRequest {
  action: 'transcribe' | 'translate' | 'detect-language' | 'generate-subtitles' | 'extract-insights';
  options?: TranscriptionOptions;
  subtitleFormat?: 'srt' | 'vtt';
  transcriptionId?: string; // For insights extraction
}

// Response types
interface TranscriptionResponse {
  success: boolean;
  data?: TranscriptionResult | string | { language: string; confidence: number } | InsightsResult;
  error?: string;
  transcriptionId?: string;
}

interface InsightsResult {
  actionItems: string[];
  keyPoints: string[];
  decisions: string[];
  questions: string[];
  nextSteps: string[];
}

/**
 * POST /api/ai/voice - Transcribe audio
 *
 * Accepts multipart/form-data with:
 * - audio: File (required) - Audio file to transcribe
 * - action: string - Action to perform (transcribe, translate, detect-language, generate-subtitles, extract-insights)
 * - options: JSON string - Transcription options
 * - subtitleFormat: string - 'srt' or 'vtt' for subtitle generation
 */
export async function POST(request: NextRequest): Promise<NextResponse<TranscriptionResponse>> {
  const startTime = Date.now();

  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('Unauthorized transcription attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const actionStr = formData.get('action') as string || 'transcribe';
    const optionsStr = formData.get('options') as string || '{}';
    const subtitleFormat = formData.get('subtitleFormat') as 'srt' | 'vtt' || 'srt';
    const transcriptionId = formData.get('transcriptionId') as string || undefined;

    // Parse action
    const action = actionStr as TranscribeRequest['action'];

    // Validate audio file for most actions
    if (action !== 'extract-insights' && !audioFile) {
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Parse options
    let options: TranscriptionOptions = {};
    try {
      options = JSON.parse(optionsStr);
    } catch {
      logger.warn('Invalid options JSON, using defaults');
    }

    // Get transcription service
    const transcriptionService = getTranscriptionService();
    const newTranscriptionId = nanoid();

    logger.info('Processing voice request', {
      action,
      userId: user.id,
      fileSize: audioFile?.size,
      fileName: audioFile?.name,
    });

    // Handle different actions
    switch (action) {
      case 'transcribe': {
        if (!audioFile) {
          return NextResponse.json(
            { success: false, error: 'Audio file is required for transcription' },
            { status: 400 }
          );
        }

        const result = await transcriptionService.transcribe(audioFile, options);

        // Store transcription in database
        await storeTranscription(supabase, user.id, newTranscriptionId, result, 'transcribe');

        logger.info('Transcription completed', {
          transcriptionId: newTranscriptionId,
          duration: result.duration,
          wordCount: result.wordCount,
          processingTime: Date.now() - startTime,
        });

        return NextResponse.json({
          success: true,
          data: result,
          transcriptionId: newTranscriptionId,
        });
      }

      case 'translate': {
        if (!audioFile) {
          return NextResponse.json(
            { success: false, error: 'Audio file is required for translation' },
            { status: 400 }
          );
        }

        const result = await transcriptionService.translateToEnglish(audioFile, options);

        // Store transcription
        await storeTranscription(supabase, user.id, newTranscriptionId, result, 'translate');

        logger.info('Translation completed', {
          transcriptionId: newTranscriptionId,
          sourceLanguage: result.language,
          processingTime: Date.now() - startTime,
        });

        return NextResponse.json({
          success: true,
          data: result,
          transcriptionId: newTranscriptionId,
        });
      }

      case 'detect-language': {
        if (!audioFile) {
          return NextResponse.json(
            { success: false, error: 'Audio file is required for language detection' },
            { status: 400 }
          );
        }

        const result = await transcriptionService.detectLanguage(audioFile);

        logger.info('Language detection completed', {
          language: result.language,
          confidence: result.confidence,
          processingTime: Date.now() - startTime,
        });

        return NextResponse.json({
          success: true,
          data: result,
        });
      }

      case 'generate-subtitles': {
        if (!audioFile) {
          return NextResponse.json(
            { success: false, error: 'Audio file is required for subtitle generation' },
            { status: 400 }
          );
        }

        const subtitles = await transcriptionService.generateSubtitles(
          audioFile,
          subtitleFormat,
          options
        );

        logger.info('Subtitles generated', {
          format: subtitleFormat,
          processingTime: Date.now() - startTime,
        });

        return NextResponse.json({
          success: true,
          data: subtitles,
        });
      }

      case 'extract-insights': {
        // For insights, we need an existing transcription
        if (!transcriptionId) {
          return NextResponse.json(
            { success: false, error: 'transcriptionId is required for insights extraction' },
            { status: 400 }
          );
        }

        // Fetch transcription from database
        const { data: storedTranscription, error: fetchError } = await supabase
          .from('transcriptions')
          .select('result')
          .eq('id', transcriptionId)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !storedTranscription) {
          return NextResponse.json(
            { success: false, error: 'Transcription not found' },
            { status: 404 }
          );
        }

        const transcriptionResult = storedTranscription.result as TranscriptionResult;
        const insights = await transcriptionService.extractInsights(transcriptionResult);

        // Update transcription with insights
        await supabase
          .from('transcriptions')
          .update({ insights, updated_at: new Date().toISOString() })
          .eq('id', transcriptionId);

        logger.info('Insights extracted', {
          transcriptionId,
          actionItems: insights.actionItems.length,
          keyPoints: insights.keyPoints.length,
          processingTime: Date.now() - startTime,
        });

        return NextResponse.json({
          success: true,
          data: insights,
          transcriptionId,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Voice transcription API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/voice - Get transcription history or specific transcription
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const transcriptionId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const query = searchParams.get('query');

    if (transcriptionId) {
      // Get specific transcription
      const { data, error } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('id', transcriptionId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { success: false, error: 'Transcription not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
      });
    }

    // List transcriptions
    let dbQuery = supabase
      .from('transcriptions')
      .select('id, type, language, duration, word_count, insights, created_at, metadata', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Search in transcription text if query provided
    if (query) {
      dbQuery = dbQuery.textSearch('text_content', query);
    }

    const { data, error, count } = await dbQuery;

    if (error) {
      logger.error('Error fetching transcriptions', { error: error.message });
      return NextResponse.json(
        { success: false, error: 'Failed to fetch transcriptions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    logger.error('Voice transcription GET error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/voice - Delete a transcription
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const transcriptionId = searchParams.get('id');

    if (!transcriptionId) {
      return NextResponse.json(
        { success: false, error: 'Transcription ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('transcriptions')
      .delete()
      .eq('id', transcriptionId)
      .eq('user_id', user.id);

    if (error) {
      logger.error('Error deleting transcription', { error: error.message });
      return NextResponse.json(
        { success: false, error: 'Failed to delete transcription' },
        { status: 500 }
      );
    }

    logger.info('Transcription deleted', { transcriptionId, userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'Transcription deleted successfully',
    });
  } catch (error) {
    logger.error('Voice transcription DELETE error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Store transcription in database
 */
async function storeTranscription(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  transcriptionId: string,
  result: TranscriptionResult,
  type: 'transcribe' | 'translate'
) {
  try {
    await supabase.from('transcriptions').insert({
      id: transcriptionId,
      user_id: userId,
      type,
      text_content: result.text,
      result,
      language: result.language,
      duration: result.duration,
      word_count: result.wordCount,
      speakers: result.speakers || [],
      metadata: result.metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn('Failed to store transcription in database', {
      error: error instanceof Error ? error.message : 'Unknown error',
      transcriptionId,
    });
    // Don't throw - transcription was successful, storage is secondary
  }
}

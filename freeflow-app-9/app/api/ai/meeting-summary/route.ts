/**
 * Meeting Summary API - FreeFlow A+++ Implementation
 * AI-powered meeting intelligence with action items, decisions, and follow-ups
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  MeetingSummarizerService,
  MeetingSummary,
  SummarizerOptions,
  MeetingTranscript,
} from '@/lib/ai/meeting-summarizer';
import { createSimpleLogger } from '@/lib/simple-logger';

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

const logger = createSimpleLogger('ai-meeting-summary');

// Initialize service
const summarizer = new MeetingSummarizerService();

// ============================================================================
// TYPES
// ============================================================================

interface SummarizePayload {
  transcript: string;
  meetingId?: string;
  title?: string;
  speakers?: string[];
  duration?: number;
  segments?: Array<{
    speaker?: string;
    start: number;
    end: number;
    text: string;
  }>;
  options?: SummarizerOptions;
}

interface QuickSummarizePayload {
  text: string;
}

// ============================================================================
// POST - Generate meeting summary
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'summarize';

    switch (action) {
      case 'summarize': {
        const payload = body as SummarizePayload;

        if (!payload.transcript || payload.transcript.trim().length === 0) {
          return NextResponse.json(
            { error: 'Transcript is required' },
            { status: 400 }
          );
        }

        // Build transcript object
        const transcript: MeetingTranscript = {
          id: payload.meetingId || `meeting_${Date.now()}`,
          text: payload.transcript,
          speakers: payload.speakers || [],
          duration: payload.duration || estimateDuration(payload.transcript),
          segments: payload.segments,
          language: 'en',
        };

        // Generate summary
        const summary = await summarizer.summarize(transcript, payload.options || {});

        // Store in database
        const { data: stored, error: storeError } = await supabase
          .from('meeting_summaries')
          .insert({
            id: summary.id,
            user_id: user.id,
            meeting_id: payload.meetingId || null,
            title: summary.title,
            executive_summary: summary.executiveSummary,
            detailed_summary: summary.detailedSummary,
            bullet_points: summary.bulletPoints,
            action_items: summary.actionItems,
            decisions: summary.decisions,
            topics: summary.topics,
            questions: summary.questions,
            follow_ups: summary.followUps,
            speaker_analytics: summary.speakerAnalytics,
            sentiment: summary.sentiment,
            duration: summary.duration,
            participant_count: summary.participantCount,
            language: summary.language,
            processing_time: summary.processingTime,
            model: summary.model,
            confidence: summary.confidence,
          })
          .select()
          .single();

        if (storeError) {
          logger.warn('Could not store summary', { error: storeError });
          // Continue anyway - summary was generated
        }

        return NextResponse.json({
          success: true,
          summary,
          stored: !!stored,
        });
      }

      case 'quick': {
        const payload = body as QuickSummarizePayload;

        if (!payload.text || payload.text.trim().length === 0) {
          return NextResponse.json(
            { error: 'Text is required' },
            { status: 400 }
          );
        }

        const result = await summarizer.quickSummarize(payload.text);

        return NextResponse.json({
          success: true,
          ...result,
        });
      }

      case 'markdown': {
        const summary = body as MeetingSummary;

        if (!summary.id) {
          return NextResponse.json(
            { error: 'Valid summary object is required' },
            { status: 400 }
          );
        }

        const markdown = await summarizer.generateMarkdownNotes(summary);

        return NextResponse.json({
          success: true,
          markdown,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Error in POST /api/ai/meeting-summary', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Fetch meeting summaries
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const summaryId = searchParams.get('id');
    const meetingId = searchParams.get('meetingId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (summaryId) {
      // Fetch single summary
      const { data, error } = await supabase
        .from('meeting_summaries')
        .select('*')
        .eq('id', summaryId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Summary not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        summary: transformSummary(data),
      });
    }

    // Fetch list of summaries
    let query = supabase
      .from('meeting_summaries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (meetingId) {
      query = query.eq('meeting_id', meetingId);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching summaries', { error });
      return NextResponse.json(
        { error: 'Failed to fetch summaries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      summaries: (data || []).map(transformSummary),
      total: count || data?.length || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Error in GET /api/ai/meeting-summary', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Remove meeting summary
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const summaryId = searchParams.get('id');

    if (!summaryId) {
      return NextResponse.json(
        { error: 'Summary ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('meeting_summaries')
      .delete()
      .eq('id', summaryId)
      .eq('user_id', user.id);

    if (error) {
      logger.error('Error deleting summary', { error });
      return NextResponse.json(
        { error: 'Failed to delete summary' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Summary deleted successfully',
    });
  } catch (error) {
    logger.error('Error in DELETE /api/ai/meeting-summary', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function estimateDuration(transcript: string): number {
  // Estimate ~150 words per minute average speaking rate
  const wordCount = transcript.split(/\s+/).length;
  return Math.round((wordCount / 150) * 60); // seconds
}

function transformSummary(data: any): MeetingSummary {
  return {
    id: data.id,
    meetingId: data.meeting_id,
    title: data.title,
    executiveSummary: data.executive_summary,
    detailedSummary: data.detailed_summary,
    bulletPoints: data.bullet_points || [],
    duration: data.duration,
    participantCount: data.participant_count,
    language: data.language,
    actionItems: data.action_items || [],
    decisions: data.decisions || [],
    topics: data.topics || [],
    questions: data.questions || [],
    followUps: data.follow_ups || [],
    speakerAnalytics: data.speaker_analytics || [],
    sentiment: data.sentiment || { overall: 'neutral', score: 0, byTopic: [], bySpeaker: [] },
    processingTime: data.processing_time,
    model: data.model,
    confidence: data.confidence,
    createdAt: data.created_at,
  };
}

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

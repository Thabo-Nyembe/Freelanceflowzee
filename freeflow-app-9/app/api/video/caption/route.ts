/**
 * Video Caption API
 *
 * Automatic transcription and caption generation using OpenAI Whisper
 * Supports SRT, VTT, and JSON output formats with translation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'

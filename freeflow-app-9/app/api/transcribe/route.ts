/**
 * Transcription API
 *
 * POST /api/transcribe - Start a new transcription job
 * GET /api/transcribe - Get transcription job status or list jobs
 * DELETE /api/transcribe - Delete a transcription job
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

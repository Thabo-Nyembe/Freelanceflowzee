/**
 * Captions API
 *
 * POST /api/captions - Generate captions from transcription
 * GET /api/captions - Export captions in various formats
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('captions-api')

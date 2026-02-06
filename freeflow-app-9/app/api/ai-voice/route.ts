/**
 * AI Voice Synthesis API Routes
 *
 * REST endpoints for AI Voice Synthesis:
 * GET - Voices, syntheses, clones, projects, scripts, analytics, stats
 * POST - Create voices, syntheses, clones, projects, scripts, analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-voice')

/**
 * AI Video Generation API Routes
 *
 * REST endpoints for AI Video Generation:
 * GET - Videos, templates, analytics, history, stats, public/trending videos
 * POST - Create video, template, metadata, analytics, history
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-video')

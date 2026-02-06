/**
 * AI Design Studio API Routes
 *
 * REST endpoints for AI Design Studio:
 * GET - List projects, outputs, templates, tools, palettes, stats
 * POST - Create project, output, palette, review, track analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-design')

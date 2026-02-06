/**
 * AI Enhanced API Routes
 *
 * REST endpoints for AI Enhanced Tools:
 * GET - Tools, search, stats
 * POST - Create tools
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ai-enhanced')

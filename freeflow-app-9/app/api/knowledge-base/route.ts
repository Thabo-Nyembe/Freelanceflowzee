/**
 * Knowledge Base API Routes
 *
 * REST endpoints for Knowledge Base:
 * GET - List categories, articles, videos, FAQs, stats
 * POST - Create category, article, video, FAQ, feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('knowledge-base')

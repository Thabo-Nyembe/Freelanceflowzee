/**
 * Collaboration Media API Routes
 *
 * REST endpoints for Collaboration Media:
 * GET - Media files, shared media, stats
 * POST - Create media, share media
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('collaboration-media')

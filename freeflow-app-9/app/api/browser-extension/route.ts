/**
 * Browser Extension API Routes
 *
 * REST endpoints for Browser Extension:
 * GET - List installations, captures, actions, sync items, analytics, stats
 * POST - Create installation, capture, action, sync item, analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('browser-extension')

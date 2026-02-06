/**
 * Collaboration Workspace API Routes
 *
 * REST endpoints for Workspace Management:
 * GET - List folders, files, shares, stats, folder contents
 * POST - Create folder, file, share
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('collaboration-workspace')

/**
 * Collaboration Workspace API - Single Resource Routes
 *
 * GET - Get single folder, file
 * PUT - Update folder, file, move file
 * DELETE - Delete folder, file, share
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('collaboration-workspace')

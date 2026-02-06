/**
 * Browser Extension API - Single Resource Routes
 *
 * GET - Get single installation, capture, action
 * PUT - Update installation, capture, action, sync status, toggle favorite/archive/enabled
 * DELETE - Delete installation, capture, action, clear syncs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('browser-extension')

/**
 * Advanced Settings API Routes
 *
 * REST endpoints for Advanced Settings:
 * GET - Data exports, settings backups, sync history, deletion request, cache logs, stats
 * POST - Create exports, backups, sync records, deletion requests, cache logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('advanced-settings')

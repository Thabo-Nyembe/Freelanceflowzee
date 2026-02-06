/**
 * Reports & Exports API Routes
 *
 * REST endpoints for Reports & Exports:
 * GET - Reports, scheduled reports, exports, time entries, expenses
 * POST - Create report, scheduled report, export, time entry, expense
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('reports-exports')

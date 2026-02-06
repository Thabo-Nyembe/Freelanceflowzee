/**
 * Reports & Exports API - Single Resource Routes
 *
 * GET - Get single report, generate report
 * PUT - Update report, scheduled report, export status, time entry, expense
 * DELETE - Delete report, scheduled report, time entry, expense, duplicate report
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('reports-exports')

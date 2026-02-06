/**
 * Custom Reports API - Single Resource Routes
 *
 * GET - Get single report, by share token
 * PUT - Update report, widget, filter, schedule, toggle favorite, increment view
 * DELETE - Delete report, widget, filter, share, schedule, export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('custom-reports')

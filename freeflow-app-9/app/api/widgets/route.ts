/**
 * Widgets API Routes
 *
 * REST endpoints for Dashboard Widgets:
 * GET - List widgets, layouts, templates, data, analytics, stats
 * POST - Create widget, layout, template, cache data, track event
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('widgets')

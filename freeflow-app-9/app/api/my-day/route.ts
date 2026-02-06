/**
 * My Day API Routes
 *
 * REST endpoints for My Day Feature:
 * GET - List goals, schedule, tasks, projects, analytics
 * POST - Create goal, schedule block, task, project
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('my-day')


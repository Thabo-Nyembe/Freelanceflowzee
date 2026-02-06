/**
 * Team Hub API Routes
 *
 * REST endpoints for Team Hub feature:
 * GET - List members, departments, get overview/stats
 * POST - Create member, department, goal, milestone, etc.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('team-hub')

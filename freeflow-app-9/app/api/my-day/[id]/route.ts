/**
 * My Day API - Single Resource Routes
 *
 * PUT - Update goal, schedule block, task, project
 * DELETE - Delete goal, schedule block, task, project
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('my-day')

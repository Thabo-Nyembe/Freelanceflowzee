/**
 * Admin Marketing API - Single Resource Routes
 *
 * PUT - Update lead, campaign, goal, metric, email campaign
 * DELETE - Delete lead, campaign, goal, metric, email campaign
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('admin-marketing')

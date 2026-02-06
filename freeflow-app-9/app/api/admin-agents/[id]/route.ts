/**
 * Admin Agents API - Single Resource Routes
 *
 * GET - Get single agent, execution, logs, metrics, configurations, performance
 * PUT - Update agent, execution, enable/disable/pause/resume/stop agent
 * DELETE - Delete agent, configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('admin-agents')

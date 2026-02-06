/**
 * Admin Agents API Routes
 *
 * REST endpoints for Admin Agents:
 * GET - Agents, executions, logs, metrics, configurations, stats
 * POST - Create agent, execution, log, metric, configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('admin-agents')

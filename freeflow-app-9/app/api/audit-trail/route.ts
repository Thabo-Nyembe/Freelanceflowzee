/**
 * Audit Trail API Routes
 *
 * REST endpoints for Audit Trail:
 * GET - List audit logs, compliance reports, findings, stats, dashboard
 * POST - Log activity, generate compliance report, add finding, export
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

/**
 * Admin Overview API Routes
 *
 * REST endpoints for Admin Dashboard:
 * GET - Dashboard stats, analytics, CRM, invoicing, marketing, operations, automation, alerts
 * POST - Create analytics event/report/goal, deal, contact, invoice, lead, campaign, team member, workflow, alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('admin-overview')

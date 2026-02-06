/**
 * CRM API Routes
 *
 * REST endpoints for CRM feature:
 * GET - List contacts, leads, deals, activities, notes, or stats
 * POST - Create contact, lead, deal, activity, or note
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('crm')

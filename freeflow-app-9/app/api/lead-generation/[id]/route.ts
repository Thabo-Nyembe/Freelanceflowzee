/**
 * Lead Generation API - Single Resource Routes
 *
 * PUT - Update lead, campaign, landing page, form
 * DELETE - Delete form field
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('lead-generation')

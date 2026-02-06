/**
 * CRM API - Single Resource Routes
 *
 * GET - Get single contact, lead, deal
 * PUT - Update contact, lead, deal, activity
 * DELETE - Delete contact, lead, deal, activity, note
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('crm-resource')

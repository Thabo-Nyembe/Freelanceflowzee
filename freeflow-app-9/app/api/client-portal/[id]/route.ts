/**
 * Client Portal API - Single Resource Routes
 *
 * GET - Get single client, project, milestones, risks, communications, files, invoices, activities, metrics
 * PUT - Update client, project, communication, file, invoice, milestone, risk
 * DELETE - Delete client, project, communication, file, invoice, milestone, risk
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('client-portal')

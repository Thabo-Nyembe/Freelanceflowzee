/**
 * Email Marketing API - Single Resource Routes
 *
 * PUT - Update campaign, subscriber, segment, template, automation, schedule/send campaign
 * DELETE - Delete campaign, subscriber, segment, template, automation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('email-marketing')

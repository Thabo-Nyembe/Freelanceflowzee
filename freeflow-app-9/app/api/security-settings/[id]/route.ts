/**
 * Security Settings API - Single Resource Routes
 *
 * GET - Get single trusted device
 * PUT - Update trusted device, backup code, alert
 * DELETE - Delete trusted device, backup codes, password history, alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('security-settings')

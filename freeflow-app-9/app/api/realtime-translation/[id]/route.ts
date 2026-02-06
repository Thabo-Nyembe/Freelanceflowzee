/**
 * Realtime Translation API - Single Resource Routes
 *
 * PUT - Update request status, session status, participant status, document progress
 * DELETE - Delete session, document, glossary, term
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('realtime-translation')

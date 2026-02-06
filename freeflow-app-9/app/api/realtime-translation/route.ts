/**
 * Realtime Translation API Routes
 *
 * REST endpoints for Translation:
 * GET - List requests, results, sessions, participants, transcripts, documents, memory, glossaries, stats
 * POST - Create request, session, participant, document, memory entry, glossary, term
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('realtime-translation')

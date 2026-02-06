/**
 * Audio Studio API - Single Resource Routes
 *
 * PUT - Update project, track, region, effect, recording status, export status
 * DELETE - Delete project, file, track, region, effect, marker, recording
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('audio-studio')

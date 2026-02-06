/**
 * Motion Graphics API - Single Resource Routes
 *
 * PUT - Update project, layer, export status
 * DELETE - Delete project, layer, animation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('motion-graphics')

/**
 * Video Merge/Concatenate API
 *
 * Merge multiple videos into one, add transitions, and overlay content
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'

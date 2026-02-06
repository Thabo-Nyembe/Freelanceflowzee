/**
 * Video Thumbnail API
 *
 * Generate thumbnails from video files using FFmpeg
 * Supports static thumbnails and animated previews
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'

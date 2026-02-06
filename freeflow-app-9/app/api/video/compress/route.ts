/**
 * Video Compression API
 *
 * Compress videos to reduce file size while maintaining quality
 * Supports target size specification and quality presets
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { createClient } from '@/lib/supabase/server'

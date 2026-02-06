/**
 * Remotion Video Render API
 *
 * POST /api/remotion/render - Start a new render job
 * GET /api/remotion/render - Get render job status
 * DELETE /api/remotion/render - Cancel/delete render job
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

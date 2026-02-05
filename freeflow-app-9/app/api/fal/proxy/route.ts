import { route } from "@fal-ai/server-proxy/nextjs"


import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
// fal.ai proxy for secure API key handling
// Supports Nano Banana image generation and other fal.ai models
export const GET = route.GET
export const POST = route.POST
export const PUT = route.PUT

'use client'

export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import LeadGenerationClient from './lead-generation-client'

function LeadGenerationClientWrapper() {
  return <LeadGenerationClient initialLeads={[]} />
}

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  // Suspense is required for useSearchParams in Next.js 14+
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <LeadGenerationClientWrapper />
    </Suspense>
  )
}

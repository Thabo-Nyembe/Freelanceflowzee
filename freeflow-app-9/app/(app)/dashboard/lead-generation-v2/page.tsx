'use client'

import LeadGenerationClient from './lead-generation-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <LeadGenerationClient initialLeads={[]} />
}

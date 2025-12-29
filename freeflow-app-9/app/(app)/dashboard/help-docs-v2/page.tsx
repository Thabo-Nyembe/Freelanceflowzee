'use client'

export const dynamic = 'force-dynamic';

import HelpDocsClient from './help-docs-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <HelpDocsClient initialDocs={[]} />
}

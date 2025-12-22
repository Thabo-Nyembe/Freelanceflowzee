'use client'

import DocumentationClient from './documentation-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <DocumentationClient initialDocs={[]} />
}

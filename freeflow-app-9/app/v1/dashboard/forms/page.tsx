'use client'

export const dynamic = 'force-dynamic'

import FormsClient from './forms-client'

export default function Page() {
  // Auth is handled by middleware
  // Data fetching is handled by the client component's hooks
  return <FormsClient initialForms={[]} />
}

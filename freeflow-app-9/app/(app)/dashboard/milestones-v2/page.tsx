'use client'

import MilestonesClient from './milestones-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <MilestonesClient initialData={[]} />
}

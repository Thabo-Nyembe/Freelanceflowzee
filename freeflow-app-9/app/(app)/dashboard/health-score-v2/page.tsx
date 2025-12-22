'use client'

import HealthScoreClient from './health-score-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <HealthScoreClient initialHealthScores={[]} />
}

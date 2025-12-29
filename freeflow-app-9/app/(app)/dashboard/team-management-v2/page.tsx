'use client'

export const dynamic = 'force-dynamic';

import TeamManagementClient from './team-management-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <TeamManagementClient initialTeams={[]} />
}

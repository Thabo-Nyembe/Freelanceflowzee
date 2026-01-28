'use client'

export const dynamic = 'force-dynamic';

import DeploymentsClient from './deployments-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <DeploymentsClient initialDeployments={[]} />
}

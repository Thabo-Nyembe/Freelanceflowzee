export const dynamic = 'force-dynamic';

import WorkflowsClient from './workflows-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <WorkflowsClient initialData={[]} />
}

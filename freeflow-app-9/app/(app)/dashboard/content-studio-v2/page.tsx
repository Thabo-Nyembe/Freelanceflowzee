export const dynamic = 'force-dynamic';

import ContentStudioClient from './content-studio-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <ContentStudioClient initialProjects={[]} />
}

'use client'

export const dynamic = 'force-dynamic';

import TutorialsClient from './tutorials-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's useTutorials hook
  return <TutorialsClient />
}

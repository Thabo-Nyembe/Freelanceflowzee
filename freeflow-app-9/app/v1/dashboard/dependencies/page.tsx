'use client'

export const dynamic = 'force-dynamic';

import DependenciesClient from './dependencies-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <DependenciesClient initialDependencies={[]} />
}

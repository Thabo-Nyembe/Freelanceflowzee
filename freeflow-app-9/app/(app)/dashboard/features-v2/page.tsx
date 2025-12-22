'use client'

import FeaturesClient from './features-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <FeaturesClient initialFeatures={[]} />
}

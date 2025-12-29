export const dynamic = 'force-dynamic';

import MobileAppClient from './mobile-app-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <MobileAppClient initialFeatures={[]} />
}

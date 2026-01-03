export const dynamic = 'force-dynamic';

import MarketplaceClient from './marketplace-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <MarketplaceClient initialData={[]} />
}

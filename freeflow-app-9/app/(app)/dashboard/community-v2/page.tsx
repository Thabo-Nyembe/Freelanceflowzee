export const dynamic = 'force-dynamic';

import CommunityClient from './community-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <CommunityClient initialCommunities={[]} />
}

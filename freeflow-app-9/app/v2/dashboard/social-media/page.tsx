export const dynamic = 'force-dynamic';

import SocialMediaClient from './social-media-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <SocialMediaClient initialPosts={[]} />
}

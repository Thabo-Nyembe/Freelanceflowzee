'use client'

import AudioStudioClient from './audio-studio-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <AudioStudioClient initialData={[]} />
}

'use client'

import WidgetLibraryClient from './widget-library-client'

export default function Page() {
  // Auth is handled by NextAuth middleware
  // Data fetching is handled by the client component's hooks
  return <WidgetLibraryClient initialWidgets={[]} />
}

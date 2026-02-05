import { redirect } from 'next/navigation'

export default function EnvironmentSettingsPage({
  params,
}: {
  params: { id: string }
}) {
  // Redirect to builds page with environment settings tab
  redirect(`/dashboard/builds-v2?environment=${params.id}&tab=settings`)
}

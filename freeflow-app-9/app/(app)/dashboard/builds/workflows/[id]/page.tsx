import { redirect } from 'next/navigation'

export default function WorkflowDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Redirect to builds page with workflow details
  redirect(`/dashboard/builds-v2?workflow=${params.id}`)
}

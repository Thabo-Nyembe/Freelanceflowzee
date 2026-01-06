import { redirect } from 'next/navigation'

export default function Page() {
  redirect('/dashboard/projects-hub-v2?tab=active')
}

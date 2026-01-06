import { redirect } from 'next/navigation'

export default function Page() {
  redirect('/dashboard/my-day-v2?tab=schedule')
}

import { redirect } from 'next/navigation'

export default function Page() {
  redirect('/dashboard/bookings-v2?tab=analytics')
}

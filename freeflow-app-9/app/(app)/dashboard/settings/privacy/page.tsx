import { redirect } from 'next/navigation'

export default function PrivacyPage() {
  redirect('/dashboard/settings-v2?tab=privacy')
}

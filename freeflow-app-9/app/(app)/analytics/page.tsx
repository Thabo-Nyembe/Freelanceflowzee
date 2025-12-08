"use client";

// A+++ UTILITIES
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

export default function AnalyticsPage() {
  // A+++ STATE MANAGEMENT
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <p>Analytics dashboard coming soon.</p>
    </div>
  );
}

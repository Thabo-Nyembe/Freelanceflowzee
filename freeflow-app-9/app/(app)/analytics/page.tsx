"use client";

import { redirect } from 'next/navigation';

export default function AnalyticsPage() {
  // Redirect to the V2 analytics dashboard with full functionality
  redirect('/dashboard/analytics-v2');
}

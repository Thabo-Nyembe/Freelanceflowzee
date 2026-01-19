/**
 * Goals Page - FreeFlow A+++ Implementation
 * Full goals and OKRs management interface
 */

import { Metadata } from 'next';
import { GoalsDashboard } from '@/components/goals';

export const metadata: Metadata = {
  title: 'Goals & OKRs | FreeFlow',
  description: 'Set objectives, track key results, and achieve your goals',
};

export default function GoalsPage() {
  return (
    <div className="container py-6 space-y-6">
      <GoalsDashboard />
    </div>
  );
}

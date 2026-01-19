/**
 * Disputes Dashboard Page - FreeFlow A+++ Implementation
 * Main page for managing disputes
 */

import { Metadata } from 'next';
import { DisputeList } from '@/components/disputes';

export const metadata: Metadata = {
  title: 'Disputes | FreeFlow',
  description: 'Manage your disputes and resolutions',
};

export default function DisputesPage() {
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <DisputeList />
    </div>
  );
}

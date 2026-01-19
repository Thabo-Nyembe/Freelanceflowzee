/**
 * Dispute Detail Page - FreeFlow A+++ Implementation
 * View and manage a specific dispute
 */

import { Metadata } from 'next';
import { DisputeDetail } from '@/components/disputes';

export const metadata: Metadata = {
  title: 'Dispute Details | FreeFlow',
  description: 'View and manage dispute details',
};

interface DisputeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DisputeDetailPage({ params }: DisputeDetailPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <DisputeDetail disputeId={id} />
    </div>
  );
}

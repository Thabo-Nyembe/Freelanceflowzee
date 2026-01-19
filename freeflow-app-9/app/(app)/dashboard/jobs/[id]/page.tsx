'use client';

/**
 * Job Detail Page - FreeFlow A+++ Implementation
 * Full job details with apply functionality
 */

import { use } from 'react';
import { JobDetail } from '@/components/jobs';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);

  return (
    <div className="container py-6 max-w-6xl">
      <JobDetail jobId={id} />
    </div>
  );
}

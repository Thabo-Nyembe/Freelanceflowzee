'use client';

/**
 * Post New Job Page - FreeFlow A+++ Implementation
 * Job posting form for clients
 */

import { JobForm } from '@/components/jobs';

export default function PostJobPage() {
  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Post a Job</h1>
        <p className="text-muted-foreground">
          Find the perfect freelancer for your project
        </p>
      </div>

      <JobForm />
    </div>
  );
}

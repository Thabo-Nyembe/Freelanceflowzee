'use client';

/**
 * Jobs Page - FreeFlow A+++ Implementation
 * Main job browse page for freelancers
 */

import { JobList } from '@/components/jobs';

export default function JobsPage() {
  return (
    <div className="container py-6">
      <JobList
        title="Find Work"
        description="Browse thousands of opportunities matching your skills"
        showFilters={true}
      />
    </div>
  );
}

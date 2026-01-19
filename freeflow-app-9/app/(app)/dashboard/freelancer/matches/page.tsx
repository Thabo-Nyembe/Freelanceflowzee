'use client';

/**
 * Best Matches Page - FreeFlow A+++ Implementation
 * AI-powered job matches for freelancers
 */

import { JobMatches } from '@/components/jobs';

export default function MatchesPage() {
  return (
    <div className="container py-6">
      <JobMatches limit={20} showInsights={true} />
    </div>
  );
}

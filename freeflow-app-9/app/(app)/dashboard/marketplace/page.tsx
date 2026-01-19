/**
 * Marketplace Page - FreeFlow A+++ Implementation
 * Browse and search services
 */

import { Metadata } from 'next';
import { ServiceMarketplace } from '@/components/marketplace';

export const metadata: Metadata = {
  title: 'Service Marketplace | FreeFlow',
  description: 'Find professional services from verified freelancers',
};

export default function MarketplacePage() {
  return (
    <div className="container py-6">
      <ServiceMarketplace />
    </div>
  );
}

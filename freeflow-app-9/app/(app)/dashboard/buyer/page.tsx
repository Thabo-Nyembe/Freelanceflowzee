/**
 * Buyer Dashboard Page - FreeFlow A+++ Implementation
 * Buyer overview with orders and saved services
 */

import { Metadata } from 'next';
import { BuyerDashboard } from '@/components/marketplace';

export const metadata: Metadata = {
  title: 'My Dashboard | FreeFlow',
  description: 'Track your orders and manage saved services',
};

export default function BuyerPage() {
  return (
    <div className="container py-6">
      <BuyerDashboard />
    </div>
  );
}

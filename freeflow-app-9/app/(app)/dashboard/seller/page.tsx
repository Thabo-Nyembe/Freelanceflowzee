/**
 * Seller Dashboard Page - FreeFlow A+++ Implementation
 * Seller overview with orders, listings, and analytics
 */

import { Metadata } from 'next';
import { SellerDashboard } from '@/components/marketplace';

export const metadata: Metadata = {
  title: 'Seller Dashboard | FreeFlow',
  description: 'Manage your services, orders, and earnings',
};

export default function SellerPage() {
  return (
    <div className="container py-6">
      <SellerDashboard />
    </div>
  );
}

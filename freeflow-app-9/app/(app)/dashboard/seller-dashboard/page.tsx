/**
 * Seller Dashboard Page - FreeFlow A+++ Implementation
 * Comprehensive seller performance and level tracking
 */

import { Metadata } from 'next';
import { SellerDashboardClient } from './seller-dashboard-client';

export const metadata: Metadata = {
  title: 'Seller Dashboard | FreeFlow',
  description: 'Track your seller performance, level progress, badges, and account health',
};

export default function SellerDashboardPage() {
  return <SellerDashboardClient />;
}

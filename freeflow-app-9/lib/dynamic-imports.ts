/**
 * Dynamic Import Utilities for Code Splitting
 *
 * This module provides utilities for lazy loading heavy components
 * to reduce the initial bundle size.
 *
 * @copyright Copyright (c) 2025 KAZI. All rights reserved.
 */

import dynamic from 'next/dynamic';
import React from 'react';

// =====================================================
// LOADING COMPONENTS
// =====================================================

const LoadingSkeleton = () =>
  React.createElement('div', {
    className: 'animate-pulse h-96 bg-muted rounded-lg',
  });

const LoadingSpinner = () =>
  React.createElement('div', {
    className: 'flex items-center justify-center h-64',
    children: React.createElement('div', {
      className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary',
    }),
  });

const ChartLoading = () =>
  React.createElement('div', {
    className: 'animate-pulse h-64 bg-muted rounded-lg',
  });

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function createDynamicComponent(
  importFn: () => Promise<any>,
  options: {
    loading?: () => React.ReactElement;
    ssr?: boolean;
  } = {}
) {
  const { loading = LoadingSkeleton, ssr = false } = options;

  return dynamic(importFn, {
    loading,
    ssr,
  });
}

// Utility for conditional imports (server-side)
export async function conditionalImport<T>(
  condition: boolean,
  importFn: () => Promise<T>
): Promise<T | null> {
  if (condition) {
    return await importFn();
  }
  return null;
}

// =====================================================
// DASHBOARD COMPONENTS
// =====================================================

export const LazyDashboard = dynamic(
  () => import('@/components/dashboard/enhanced-interactive-dashboard'),
  {
    loading: LoadingSkeleton,
    ssr: false,
  }
);

export const LazyBusinessIntelligence = dynamic(
  () => import('@/components/dashboard/business-intelligence'),
  {
    loading: ChartLoading,
    ssr: false,
  }
);

// =====================================================
// VIDEO COMPONENTS (Mux: ~33MB)
// =====================================================

export const LazyVideoStudio = dynamic(
  () => import('@/components/video/video-recording-system'),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

export const LazyVideoPlayer = dynamic(
  () => import('@/components/video/lazy-video-player'),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

// =====================================================
// AI COMPONENTS
// =====================================================

export const LazyAICreate = dynamic(
  () => import('@/components/ai/ai-create-studio'),
  {
    loading: LoadingSkeleton,
    ssr: false,
  }
);

export const LazyAIAssistant = dynamic(
  () => import('@/components/ai/ai-assistant'),
  {
    loading: LoadingSkeleton,
    ssr: false,
  }
);

// =====================================================
// EDITOR COMPONENTS (TipTap: ~7MB, BlockNote: ~29MB)
// =====================================================

export const LazyRichTextEditor = dynamic(
  () => import('@/components/editors/rich-text-editor'),
  {
    loading: LoadingSkeleton,
    ssr: false,
  }
);

export const LazyBlockEditor = dynamic(
  () => import('@/components/editors/block-editor'),
  {
    loading: LoadingSkeleton,
    ssr: false,
  }
);

// =====================================================
// CHART COMPONENTS (Recharts: ~8MB)
// =====================================================

export const LazyCharts = dynamic(
  () => import('@/components/ui/chart'),
  {
    loading: ChartLoading,
    ssr: false,
  }
);

// =====================================================
// COLLABORATION COMPONENTS
// =====================================================

export const LazyVideoCall = dynamic(
  () => import('@/components/collaboration/video-call'),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

export const LazyRealtimeChat = dynamic(
  () => import('@/components/messages/realtime-chat'),
  {
    loading: LoadingSkeleton,
    ssr: false,
  }
);

// =====================================================
// MARKETING COMPONENTS
// =====================================================

export const LazyExitPopup = dynamic(
  () =>
    import('@/components/marketing/exit-intent-popup').then((mod) => ({
      default: mod.ExitIntentPopup,
    })),
  {
    ssr: false,
  }
);

export const LazyChatWidget = dynamic(
  () =>
    import('@/components/marketing/live-chat-widget').then((mod) => ({
      default: mod.LiveChatWidget,
    })),
  {
    ssr: false,
  }
);

// =====================================================
// ONBOARDING COMPONENTS
// =====================================================

export const LazyOnboardingTour = dynamic(
  () => import('@/components/onboarding/onboarding-tour'),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyHelpWidget = dynamic(
  () => import('@/components/onboarding/help-widget'),
  {
    ssr: false,
  }
);

// =====================================================
// PRELOAD UTILITIES
// =====================================================

/**
 * Preload a component in the background
 * Use this when you anticipate a user will need a component soon
 */
export function preloadComponent(componentImport: () => Promise<unknown>): void {
  componentImport();
}

/**
 * Preload hints for common navigation patterns
 */
export const preloadHints = {
  // Preload when user hovers over video menu
  videoStudio: () => import('@/components/video/video-recording-system'),

  // Preload when user hovers over AI menu
  aiCreate: () => import('@/components/ai/ai-create-studio'),

  // Preload charts when navigating to analytics
  analytics: () => import('@/components/ui/chart'),

  // Preload editor when user starts new document
  editor: () => import('@/components/editors/rich-text-editor'),
};
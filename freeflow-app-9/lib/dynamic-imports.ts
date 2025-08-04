// Dynamic import utilities for code splitting
import dynamic from 'next/dynamic';
import React from 'react';

export function createDynamicComponent(importFn: () => Promise<any>, options: any = {}) {
  const { 
    loading = () => React.createElement('div', null, 'Loading...'),
    error = () => React.createElement('div', null, 'Failed to load component')
  } = options;
  
  return dynamic(importFn, {
    loading,
    error
  });
}

// Lazy load heavy components
export const LazyDashboard = dynamic(() => import('@/components/dashboard/enhanced-interactive-dashboard'), {
  loading: () => React.createElement('div', { className: 'animate-pulse h-96 bg-gray-200 rounded' })
});

export const LazyVideoStudio = dynamic(() => import('@/components/video/video-recording-system'), {
  loading: () => React.createElement('div', { className: 'animate-pulse h-96 bg-gray-200 rounded' })
});

export const LazyAICreate = dynamic(() => import('@/components/ai/ai-create-studio'), {
  loading: () => React.createElement('div', { className: 'animate-pulse h-96 bg-gray-200 rounded' })
});

// Utility for conditional imports
export async function conditionalImport(condition: boolean, importFn: () => Promise<any>) {
  if (condition) {
    return await importFn();
  }
  return null;
}
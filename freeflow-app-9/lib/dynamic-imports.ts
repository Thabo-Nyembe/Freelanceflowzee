// Dynamic import utilities for code splitting

export function createDynamicComponent(importFn: unknown, options = {}: unknown) {
  const { 
    loading = () => <div>Loading...</div>,
    error = () => <div>Failed to load component</div>
  } = options;
  
  return dynamic(importFn, {
    loading,
    error
  });
}

// Lazy load heavy components
export const LazyDashboard = dynamic(() => import('@/components/dashboard/enhanced-interactive-dashboard'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
});

export const LazyVideoStudio = dynamic(() => import('@/components/video/video-recording-system'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
});

export const LazyAICreate = dynamic(() => import('@/components/ai/ai-create-studio'), {
  loading: () => <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
});

// Utility for conditional imports
export async function conditionalImport(condition: unknown, importFn: unknown) {
  if (condition) {
    return await importFn();
  }
  return null;
}
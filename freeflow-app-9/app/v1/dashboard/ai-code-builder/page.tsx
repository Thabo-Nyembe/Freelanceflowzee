import { Suspense } from 'react';
import AICodeBuilderV2Client from './ai-code-builder-v2-client';

export const metadata = {
  title: 'AI Code Builder V2 | FreeFlow Kazi',
  description: 'Advanced Manus-like AI code builder with sandbox, browser preview, and multi-tool orchestration'
};

export default function AICodeBuilderV2Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-50 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
          <p className="text-gray-400 animate-pulse">Initializing AI Code Builder...</p>
        </div>
      </div>
    }>
      <AICodeBuilderV2Client />
    </Suspense>
  );
}

import { Suspense } from 'react';
import AICodeBuilderClient from './ai-code-builder-client';

export const metadata = {
  title: 'AI Code Builder | FreeFlow Kazi',
  description: 'Generate full-stack applications from natural language using Manus-like AI'
};

export default function AICodeBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AICodeBuilderClient />
    </Suspense>
  );
}

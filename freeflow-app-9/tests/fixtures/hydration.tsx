import React from 'react';
import { render } from '@testing-library/react';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabaseClient = createClient('http://localhost:54321', 'test-anon-key');

// Create a wrapper component that provides all necessary context
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
};

// Custom render function that wraps component with providers
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestWrapper });
}

// Helper to simulate client-side navigation
export async function waitForHydration() {
  // Wait for any client-side transitions to complete
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// Mock data for hydration tests
export const mockHydrationData = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
  },
  projects: [
    {
      id: 'test-project-id',
      title: 'Test Project',
      description: 'A test project',
    },
  ],
  posts: [
    {
      id: 'test-post-id',
      title: 'Test Post',
      content: 'Test content',
    },
  ],
};

// Mock Supabase responses
export const mockSupabaseResponses = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: mockHydrationData.user }, error: null }),
  },
  data: {
    projects: () => Promise.resolve({ data: mockHydrationData.projects, error: null }),
    posts: () => Promise.resolve({ data: mockHydrationData.posts, error: null }),
  },
}; 
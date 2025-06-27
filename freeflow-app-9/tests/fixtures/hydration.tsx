import React from &apos;react&apos;;
import { render } from &apos;@testing-library/react&apos;;
import { createClient } from &apos;@supabase/supabase-js&apos;;

// Mock Supabase client
const mockSupabaseClient = createClient(&apos;http://localhost:54321&apos;, &apos;test-anon-key&apos;);

// Create a wrapper component that provides all necessary context
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-testid=&quot;test-wrapper&quot;>
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
    id: &apos;test-user-id&apos;,
    email: &apos;test@example.com&apos;,
  },
  projects: [
    {
      id: &apos;test-project-id&apos;,
      title: &apos;Test Project&apos;,
      description: &apos;A test project&apos;,
    },
  ],
  posts: [
    {
      id: &apos;test-post-id&apos;,
      title: &apos;Test Post&apos;,
      content: &apos;Test content&apos;,
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
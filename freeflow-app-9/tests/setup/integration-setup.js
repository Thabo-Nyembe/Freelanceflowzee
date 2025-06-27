import &apos;@testing-library/jest-dom&apos;;
import { server } from &apos;../mocks/server&apos;;

// Establish API mocking before all tests
beforeAll(() => {
  // Enable the MSW API mocking
  server.listen({
    onUnhandledRequest: &apos;warn&apos;
  });
});

// Reset any request handlers that we may add during the tests,
// so they don&apos;t affect other tests.
afterEach(() => {
  server.resetHandlers();
});

// Clean up after the tests are finished.
afterAll(() => {
  server.close();
});

// Mock Next.js router
jest.mock(&apos;next/router&apos;, () => ({
  useRouter() {
    return {
      route: &apos;/','
      pathname: '&apos;,'
      query: {},
      asPath: '&apos;,'
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Supabase client
jest.mock(&apos;@/lib/supabase/client&apos;, () => ({
  supabaseClient: {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  },
})); 
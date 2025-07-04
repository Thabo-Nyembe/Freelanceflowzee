import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Clean up after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock Service Worker setup
export const server = setupServer(
  // Define handlers
  rest.post('/api/video/upload', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'test-video-id',
        url: 'https://example.com/test-video',
      })
    );
  }),

  rest.get('/api/video/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: req.params.id,
        title: 'Test Video',
        description: 'Test Description',
        status: 'ready',
      })
    );
  }),

  rest.post('/api/video/bulk-operations', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'test-operation-id',
        status: 'completed',
      })
    );
  })
);

// Start MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers()); 
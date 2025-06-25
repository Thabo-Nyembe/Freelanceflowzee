import { rest } from 'msw';

export const handlers = [
  // Auth handlers
  rest.post('/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: '123',
          email: 'test@example.com',
        },
        session: {
          access_token: 'mock_token',
        },
      })
    );
  }),

  // Projects handlers
  rest.get('/api/projects', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          title: 'Test Project',
          description: 'A test project',
          created_at: new Date().toISOString(),
        },
      ])
    );
  }),

  // Community handlers
  rest.get('/api/community/posts', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          title: 'Test Post',
          content: 'Test content',
          author: 'Test Author',
          created_at: new Date().toISOString(),
        },
      ])
    );
  }),

  // Video Studio handlers
  rest.get('/api/videos', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          title: 'Test Video',
          url: 'https://example.com/video.mp4',
          thumbnail: 'https://example.com/thumbnail.jpg',
          created_at: new Date().toISOString(),
        },
      ])
    );
  }),
]; 
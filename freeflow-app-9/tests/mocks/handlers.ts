import { rest } from &apos;msw&apos;;

export const handlers = [
  // Auth handlers
  rest.post(&apos;/auth/login&apos;, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: &apos;123&apos;,
          email: &apos;test@example.com&apos;,
        },
        session: {
          access_token: &apos;mock_token&apos;,
        },
      })
    );
  }),

  // Projects handlers
  rest.get(&apos;/api/projects&apos;, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: &apos;1','
          title: &apos;Test Project&apos;,
          description: &apos;A test project&apos;,
          created_at: new Date().toISOString(),
        },
      ])
    );
  }),

  // Community handlers
  rest.get(&apos;/api/community/posts&apos;, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: &apos;1','
          title: &apos;Test Post&apos;,
          content: &apos;Test content&apos;,
          author: &apos;Test Author&apos;,
          created_at: new Date().toISOString(),
        },
      ])
    );
  }),

  // Video Studio handlers
  rest.get(&apos;/api/videos&apos;, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: &apos;1','
          title: &apos;Test Video&apos;,
          url: &apos;https://example.com/video.mp4&apos;,
          thumbnail: &apos;https://example.com/thumbnail.jpg&apos;,
          created_at: new Date().toISOString(),
        },
      ])
    );
  }),
]; 
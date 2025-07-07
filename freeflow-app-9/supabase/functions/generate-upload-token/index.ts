import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import ApiVideoClient from 'npm:@api.video/nodejs-client';

serve(async (_req) => {
  try {
    const apiKey = Deno.env.get('APIVIDEO_API_KEY');
    if (!apiKey) {
      throw new Error('api.video API key not found');
    }

    const client = new ApiVideoClient({ apiKey });

    const { token } = await client.uploadTokens.createToken();

    return new Response(
      JSON.stringify({ uploadToken: token }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
 
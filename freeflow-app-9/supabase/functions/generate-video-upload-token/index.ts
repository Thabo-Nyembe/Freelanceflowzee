import 'xhr-polyfill';
import { serve } from 'std/server';
import ApiVideoClient from '@api.video/nodejs-client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const client = new ApiVideoClient({ apiKey: Deno.env.get('APIVIDEO_API_KEY') });
    const token = await client.uploadTokens.createToken();

    return new Response(JSON.stringify({ token: token.token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 
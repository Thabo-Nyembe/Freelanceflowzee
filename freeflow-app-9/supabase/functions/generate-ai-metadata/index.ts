import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import { OpenAI } from 'https://esm.sh/openai@4.28.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: openaiApiKey });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { video_id } = await req.json();
    if (!video_id) {
      throw new Error('Missing video_id in request body');
    }

    // 1. Fetch video transcript
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('transcript')
      .eq('id', video_id)
      .single();

    if (videoError || !video?.transcript) {
      throw new Error(`Video or transcript not found for id: ${video_id}`);
    }

    // 2. Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert video analyst. Based on the following transcript, provide a concise one-paragraph summary, and a list of 5-10 relevant tags or keywords. Return the output as a JSON object with keys "summary" and "tags".`,
        },
        {
          role: 'user',
          content: JSON.stringify(video.transcript),
        },
      ],
      response_format: { type: 'json_object' },
    });
    
    const aiResponse = completion.choices[0].message.content;
    if (!aiResponse) {
      throw new Error('OpenAI returned an empty response.');
    }
    
    const aiMetadata = JSON.parse(aiResponse);

    // 3. Update the video record with AI metadata
    const { error: updateError } = await supabaseAdmin
      .from('videos')
      .update({ ai_metadata: aiMetadata })
      .eq('id', video_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, video_id }), {
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
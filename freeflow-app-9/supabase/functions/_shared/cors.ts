export const corsHeaders = {
  &apos;Access-Control-Allow-Origin&apos;: &apos;*',
  &apos;Access-Control-Allow-Headers&apos;: &apos;authorization, x-client-info, apikey, content-type&apos;,
  &apos;Access-Control-Allow-Methods&apos;: &apos;POST, GET, OPTIONS, PUT, DELETE&apos;
}

export const handleCors = (req: Request): Response | null => {
  if (req.method === &apos;OPTIONS&apos;) {
    return new Response(&apos;ok&apos;, { headers: corsHeaders })
  }
  return null
} 
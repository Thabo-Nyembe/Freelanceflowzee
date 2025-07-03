export async function GET() {
  return new Response(JSON.stringify({ services: [] }), { headers: { 'Content-Type': 'application/json' } });
} 
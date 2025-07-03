export async function GET() {
  return new Response(JSON.stringify({ message: 'Mock analytics events API stubbed for build.' }), { headers: { 'Content-Type': 'application/json' } });
} 
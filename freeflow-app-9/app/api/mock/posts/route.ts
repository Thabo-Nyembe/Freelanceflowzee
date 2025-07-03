export async function GET() {
  return new Response(JSON.stringify({ message: 'Mock posts API stubbed for build.' }), { headers: { 'Content-Type': 'application/json' } });
} 
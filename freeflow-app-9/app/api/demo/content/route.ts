export async function GET() {
  return new Response(JSON.stringify({ message: 'Demo content API stubbed for build.' }), { headers: { 'Content-Type': 'application/json' } });
} 
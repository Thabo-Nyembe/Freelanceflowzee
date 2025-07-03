export async function POST() {
  return new Response(JSON.stringify({ message: 'Mock analytics track event API stubbed for build.' }), { headers: { 'Content-Type': 'application/json' } });
} 
export async function GET() {
  return new Response(JSON.stringify({ message: 'UPF test API stubbed for build.' }), { headers: { 'Content-Type': 'application/json' } });
} 
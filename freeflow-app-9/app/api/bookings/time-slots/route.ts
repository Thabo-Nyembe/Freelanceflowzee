export async function GET() {
  return new Response(JSON.stringify({ timeSlots: [] }), { headers: { 'Content-Type': 'application/json' } });
} 
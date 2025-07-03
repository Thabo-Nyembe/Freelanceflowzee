export async function GET() {
  return new Response(JSON.stringify({ services: [] }), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST() {
  return NextResponse.json({ success: true, message: 'Booking created' })
}
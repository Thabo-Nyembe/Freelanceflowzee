import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Hydration Error: ', data);')
    }

    // In production, you might want to log to a service like Vercel Analytics
    // or your preferred logging service
    
    return NextResponse.json({ status: 'logged' });
  } catch (error) {
    console.error('Error logging hydration error: ', error);')
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
// Auto-generated mock API endpoint for users
import { NextRequest, NextResponse } from 'next/server';

const mockData = [
  {
    "id": "user_001",
    "full_name": "Alex Rivera",
    "avatar_url": "/avatars/alex-designer.jpg",
    "bio": "Senior Brand Designer with 8+ years of experience creating memorable identities",
    "website": "https://alexrivera.design",
    "location": "San Francisco, CA",
    "skills": [
      "Brand Design",
      "Logo Design",
      "Typography",
      "Art Direction"
    ],
    "hourly_rate": 125,
    "timezone": "America/Los_Angeles",
    "subscription_tier": "pro"
  },
  {
    "id": "user_002",
    "full_name": "Sarah Chen",
    "avatar_url": "/avatars/sarah-dev.jpg",
    "bio": "Full-stack developer specializing in React and Node.js applications",
    "website": "https://sarahchen.dev",
    "location": "Austin, TX",
    "skills": [
      "React",
      "Node.js",
      "TypeScript",
      "AWS",
      "GraphQL"
    ],
    "hourly_rate": 95,
    "timezone": "America/Chicago",
    "subscription_tier": "pro"
  },
  {
    "id": "user_003",
    "full_name": "Mike Johnson",
    "avatar_url": "/avatars/mike-manager.jpg",
    "bio": "Project manager and UX strategist helping teams deliver exceptional products",
    "website": "https://mikejohnson.pm",
    "location": "New York, NY",
    "skills": [
      "Project Management",
      "UX Strategy",
      "Agile",
      "Team Leadership"
    ],
    "hourly_rate": 110,
    "timezone": "America/New_York",
    "subscription_tier": "enterprise"
  },
  {
    "id": "user_004",
    "full_name": "Emma Martinez",
    "avatar_url": "/avatars/emma-creative.jpg",
    "bio": "Creative director and visual storyteller with a passion for innovative design",
    "website": "https://emmamartinez.co",
    "location": "Los Angeles, CA",
    "skills": [
      "Creative Direction",
      "Visual Design",
      "Photography",
      "Video Editing"
    ],
    "hourly_rate": 140,
    "timezone": "America/Los_Angeles",
    "subscription_tier": "pro"
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  const paginatedData = mockData.slice(offset, offset + limit);
  
  return NextResponse.json({
    data: paginatedData,
    total: mockData.length,
    limit,
    offset
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // In a real app, this would save to database
  const newItem = {
    id: `users_${Date.now()}`,
    ...body,
    created_at: new Date().toISOString()
  };
  
  return NextResponse.json(newItem, { status: 201 });
}

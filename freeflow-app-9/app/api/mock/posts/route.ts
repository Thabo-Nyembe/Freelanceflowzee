// Auto-generated mock API endpoint for posts
import { NextRequest, NextResponse } from 'next/server';

const mockData = [
  {
    "id": "post_001", "author_id": "user_001", "title": "Just completed a challenging brand identity project!", "content": "Excited to share this brand identity I designed for a tech startup. The process involved extensive research into their target market and competitors. What do you think of the final result?", "tags": ["branding", "identity", "startup", "design'
    ], "media_url": "/images/project-mockup-1.jpg", "likes_count": 47, "comments_count": 12, "shares_count": 8, "created_at": "2024-12-18T10:30:00Z'
  },
  {
    "id": "post_002", "author_id": "user_002", "title": "New React component library released", "content": "Just open-sourced my collection of reusable React components. Perfect for rapid prototyping and consistent design systems. Link in comments!", "tags": ["react", "components", "opensource", "development'
    ], "media_url": null, "likes_count": 89, "comments_count": 23, "shares_count": 15, "created_at": "2024-12-17T14:15:00Z'
  },
  {
    "id": "post_003", "author_id": "user_003", "title": "Project management tips for creative teams", "content": "After managing 50+ creative projects, here are my top 5 tips for keeping creative teams productive and happy. Thread below 👇", "tags": ["management", "productivity", "teams", "tips'
    ], "media_url": null, "likes_count": 156, "comments_count": 34, "shares_count": 42, "created_at": "2024-12-16T09:45:00Z'
  },
  {
    "id": "post_004", "author_id": "user_004", "title": "Behind the scenes: Client photoshoot", "content": "Had an amazing time directing this product photoshoot. The lighting setup took 3 hours but the results were worth it!", "tags": ["photography", "bts", "product", "creative'
    ], "media_url": "/images/portfolio-showcase.jpg", "likes_count": 73, "comments_count": 18, "shares_count": 11, "created_at": "2024-12-15T16:20:00Z'
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
    id: `posts_${Date.now()}`,
    ...body,
    created_at: new Date().toISOString()
  };
  
  return NextResponse.json(newItem, { status: 201 });
}

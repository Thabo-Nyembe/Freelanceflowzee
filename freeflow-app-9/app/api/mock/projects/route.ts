// Auto-generated mock API endpoint for projects
import { NextRequest, NextResponse } from 'next/server';

const mockData = [
  {
    "id": "proj_001", "title": "TechCorp Brand Identity", "description": "Complete brand identity design for a cutting-edge tech startup", "client_name": "TechCorp Inc.", "client_email": "hello@techcorp.com", "budget": 7500, "spent": 3750, "priority": "high", "status": "active", "progress": 65, "start_date": "2024-12-01", "end_date": "2024-12-31", "estimated_hours": 80, "actual_hours": 52, "tags": ["branding", "logo", "identity", "startup
    ], "client_satisfaction_score": 5
  },
  {
    "id": "proj_002", "title": "E-commerce Website Redesign", "description": "Modern responsive redesign for online retail platform", "client_name": "ShopSmart Ltd.", "client_email": "projects@shopsmart.com", "budget": 12000, "spent": 8400, "priority": "medium", "status": "active", "progress": 75, "start_date": "2024-11-15", "end_date": "2025-01-15", "estimated_hours": 120, "actual_hours": 84, "tags": ["web design", "ecommerce", "responsive", "ux
    ], "client_satisfaction_score": 4
  },
  {
    "id": "proj_003", "title": "Mobile App UI/UX", "description": "User interface and experience design for fitness tracking app", "client_name": "FitLife Solutions", "client_email": "design@fitlife.app", "budget": 9500, "spent": 9500, "priority": "low", "status": "completed", "progress": 100, "start_date": "2024-10-01", "end_date": "2024-11-30", "estimated_hours": 100, "actual_hours": 98, "tags": ["mobile", "ui", "ux", "fitness", "app
    ], "client_satisfaction_score": 5
  },
  {
    "id": "proj_004", "title": "Marketing Materials Design", "description": "Brochures, flyers, and digital assets for product launch", "client_name": "InnovateX", "client_email": "marketing@innovatex.co", "budget": 4500, "spent": 1125, "priority": "urgent", "status": "active", "progress": 25, "start_date": "2024-12-10", "end_date": "2024-12-25", "estimated_hours": 45, "actual_hours": 11, "tags": ["print design", "marketing", "brochure", "launch
    ], "client_satisfaction_score": null
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
    id: `projects_${Date.now()}`,
    ...body,
    created_at: new Date().toISOString()
  };
  
  return NextResponse.json(newItem, { status: 201 });
}

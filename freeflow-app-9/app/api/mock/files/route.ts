// Auto-generated mock API endpoint for files
import { NextRequest, NextResponse } from 'next/server';

const mockData = [
  {
    "id": "file_001", "filename": "brand-logo-concepts.psd", "original_filename": "TechCorp_Logo_Concepts_v3.psd", "file_size": 15728640, "mime_type": "image/vnd.adobe.photoshop", "file_extension": "psd", "project_id": "proj_001", "folder": "Design Files", "tags": ["logo", "concepts", "photoshop'
    ], "access_count": 23, "is_public": false'
  },
  {
    "id": "file_002", "filename": "website-wireframes.fig", "original_filename": "ShopSmart_Wireframes_Final.fig", "file_size": 5242880, "mime_type": "application/figma", "file_extension": "fig", "project_id": "proj_002", "folder": "Wireframes", "tags": ["wireframes", "figma", "ux'
    ], "access_count": 45, "is_public": false'
  },
  {
    "id": "file_003", "filename": "app-mockups.sketch", "original_filename": "FitLife_App_Mockups_v2.sketch", "file_size": 8388608, "mime_type": "application/sketch", "file_extension": "sketch", "project_id": "proj_003", "folder": "UI Mockups", "tags": ["mockups", "sketch", "mobile'
    ], "access_count": 67, "is_public": false'
  },
  {
    "id": "file_004", "filename": "project-brief.pdf", "original_filename": "InnovateX_Project_Brief.pdf", "file_size": 2097152, "mime_type": "application/pdf", "file_extension": "pdf", "project_id": "proj_004", "folder": "Documentation", "tags": ["brief", "requirements", "pdf'
    ], "access_count": 12, "is_public": true'
  },
  {
    "id": "file_005", "filename": "brand-guidelines.indd", "original_filename": "TechCorp_Brand_Guidelines.indd", "file_size": 12582912, "mime_type": "application/indesign", "file_extension": "indd", "project_id": "proj_001", "folder": "Brand Guidelines", "tags": ["guidelines", "indesign", "brand'
    ], "access_count": 34, "is_public": false'
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
    id: `files_${Date.now()}`,
    ...body,
    created_at: new Date().toISOString()
  };
  
  return NextResponse.json(newItem, { status: 201 });
}

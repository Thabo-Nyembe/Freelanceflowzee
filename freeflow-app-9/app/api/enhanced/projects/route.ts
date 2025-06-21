// Enhanced API endpoint for projects
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataPath = path.join(process.cwd(), 'public/enhanced-content/content/enhanced-projects.json');
    
    const fileContent = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Add pagination
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const paginatedData = Array.isArray(data) ? data.slice(offset, offset + limit) : data;
    
    // Add filtering by tags if provided
    const tags = searchParams.get('tags');
    let filteredData = paginatedData;
    
    if (tags && Array.isArray(paginatedData)) {
      const tagArray = tags.split(',');
      filteredData = paginatedData.filter(item => 
        item.tags && tagArray.some(tag => item.tags.includes(tag.trim()))
      );
    }
    
    return NextResponse.json({
      success: true,
      data: filteredData,
      total: Array.isArray(data) ? data.length : 1,
      pagination: {
        limit,
        offset,
        hasMore: Array.isArray(data) && (offset + limit) < data.length
      },
      metadata: {
        source: 'enhanced-api',
        lastUpdated: new Date().toISOString(),
        apiVersion: '2.0'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch projects data',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real app, this would save to database
    const newItem = {
      id: `enhanced_projects_${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Item created successfully'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to create projects item',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * Geographic Map View API for Projects & Tasks
 *
 * Beats ClickUp's Map View feature with:
 * - Geographic visualization of tasks/resources
 * - Location-based team member tracking
 * - Client location mapping
 * - Travel route optimization
 * - Distance-based task assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFeatureLogger } from '@/lib/logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('projects-map-view');

// ============================================================================
// TYPES
// ============================================================================

interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

type MarkerType = 'task' | 'project' | 'team_member' | 'client' | 'office' | 'meeting' | 'delivery';
type MarkerStatus = 'active' | 'completed' | 'pending' | 'in_progress' | 'overdue';

interface MapMarker {
  id: string;
  type: MarkerType;
  label: string;
  description: string | null;
  location: GeoLocation;
  status: MarkerStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id: string | null;
  assignee_name: string | null;
  due_date: string | null;
  color: string;
  icon: string;
  linked_id: string; // task_id, project_id, user_id, client_id
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface MapViewConfig {
  id: string;
  user_id: string;
  name: string;
  center: GeoLocation;
  zoom: number;
  filters: {
    types: MarkerType[];
    statuses: MarkerStatus[];
    date_range?: { start: string; end: string };
    assignees?: string[];
    projects?: string[];
  };
  clustering_enabled: boolean;
  show_routes: boolean;
  created_at: string;
}

interface MapViewRequest {
  action:
    | 'get-markers'
    | 'get-marker'
    | 'create-marker'
    | 'update-marker'
    | 'delete-marker'
    | 'get-team-locations'
    | 'get-client-locations'
    | 'calculate-route'
    | 'find-nearest'
    | 'get-area-tasks'
    | 'save-view'
    | 'get-views';
  id?: string;
  projectId?: string;
  location?: GeoLocation;
  radius?: number; // in km
  data?: Partial<MapMarker>;
  filters?: {
    types?: MarkerType[];
    statuses?: MarkerStatus[];
    bounds?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  waypoints?: GeoLocation[];
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoMarkers(): MapMarker[] {
  return [
    {
      id: 'marker-1',
      type: 'task',
      label: 'Client Meeting - TechCorp',
      description: 'Q1 Review Meeting with TechCorp leadership',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: '123 Market Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postal_code: '94102',
      },
      status: 'pending',
      priority: 'high',
      assignee_id: 'user-1',
      assignee_name: 'Sarah Chen',
      due_date: '2025-01-25',
      color: '#ef4444',
      icon: 'briefcase',
      linked_id: 'task-meeting-1',
      metadata: { meeting_type: 'client', duration: 60 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'marker-2',
      type: 'project',
      label: 'Website Redesign Project',
      description: 'Complete website redesign for Acme Inc',
      location: {
        latitude: 37.8044,
        longitude: -122.2712,
        address: '456 Broadway',
        city: 'Oakland',
        state: 'CA',
        country: 'USA',
        postal_code: '94607',
      },
      status: 'in_progress',
      priority: 'medium',
      assignee_id: 'user-2',
      assignee_name: 'Marcus Johnson',
      due_date: '2025-02-15',
      color: '#3b82f6',
      icon: 'folder',
      linked_id: 'proj-web-1',
      metadata: { client: 'Acme Inc', budget: 50000 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'marker-3',
      type: 'team_member',
      label: 'Sarah Chen',
      description: 'Senior Developer - Currently at client site',
      location: {
        latitude: 37.7849,
        longitude: -122.4094,
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
      },
      status: 'active',
      priority: 'medium',
      assignee_id: 'user-1',
      assignee_name: 'Sarah Chen',
      due_date: null,
      color: '#10b981',
      icon: 'user',
      linked_id: 'user-1',
      metadata: { role: 'Senior Developer', available: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'marker-4',
      type: 'client',
      label: 'TechCorp HQ',
      description: 'TechCorp Headquarters',
      location: {
        latitude: 37.7599,
        longitude: -122.4148,
        address: '789 Howard Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postal_code: '94105',
      },
      status: 'active',
      priority: 'high',
      assignee_id: null,
      assignee_name: null,
      due_date: null,
      color: '#8b5cf6',
      icon: 'building',
      linked_id: 'client-techcorp',
      metadata: { contract_value: 250000, since: '2022-01-01' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'marker-5',
      type: 'office',
      label: 'FreeFlow HQ',
      description: 'Main office location',
      location: {
        latitude: 37.7879,
        longitude: -122.4074,
        address: '1 FreeFlow Plaza',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postal_code: '94111',
      },
      status: 'active',
      priority: 'low',
      assignee_id: null,
      assignee_name: null,
      due_date: null,
      color: '#f59e0b',
      icon: 'home',
      linked_id: 'office-hq',
      metadata: { capacity: 50, floors: 3 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'marker-6',
      type: 'delivery',
      label: 'Equipment Delivery',
      description: 'New laptops for remote team',
      location: {
        latitude: 37.3382,
        longitude: -121.8863,
        address: '100 Innovation Drive',
        city: 'San Jose',
        state: 'CA',
        country: 'USA',
        postal_code: '95110',
      },
      status: 'pending',
      priority: 'medium',
      assignee_id: 'user-3',
      assignee_name: 'Emily Rodriguez',
      due_date: '2025-01-22',
      color: '#06b6d4',
      icon: 'truck',
      linked_id: 'delivery-1',
      metadata: { items: 5, tracking: 'TRACK123' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

function getDemoTeamLocations() {
  return [
    {
      user_id: 'user-1',
      name: 'Sarah Chen',
      role: 'Senior Developer',
      location: { latitude: 37.7849, longitude: -122.4094, city: 'San Francisco' },
      status: 'online',
      last_updated: new Date().toISOString(),
    },
    {
      user_id: 'user-2',
      name: 'Marcus Johnson',
      role: 'Backend Engineer',
      location: { latitude: 37.8044, longitude: -122.2712, city: 'Oakland' },
      status: 'busy',
      last_updated: new Date().toISOString(),
    },
    {
      user_id: 'user-3',
      name: 'Emily Rodriguez',
      role: 'Designer',
      location: { latitude: 37.3382, longitude: -121.8863, city: 'San Jose' },
      status: 'away',
      last_updated: new Date().toISOString(),
    },
    {
      user_id: 'user-4',
      name: 'James Wilson',
      role: 'DevOps',
      location: { latitude: 37.5585, longitude: -122.2711, city: 'San Mateo' },
      status: 'online',
      last_updated: new Date().toISOString(),
    },
  ];
}

// ============================================================================
// UTILITIES
// ============================================================================

function calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
  // Haversine formula for distance between two points
  const R = 6371; // Earth's radius in km
  const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.latitude * Math.PI) / 180) *
      Math.cos((loc2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================================================
// HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const types = searchParams.get('types')?.split(',') as MarkerType[] | undefined;

    let markers = getDemoMarkers();

    if (types?.length) {
      markers = markers.filter(m => types.includes(m.type));
    }

    return NextResponse.json({
      success: true,
      data: {
        markers,
        center: { latitude: 37.7749, longitude: -122.4194 },
        zoom: 11,
        total: markers.length,
      },
      source: 'demo',
    });
  } catch (err) {
    logger.error('Map View GET error', { error: err });
    return NextResponse.json({
      success: true,
      data: { markers: getDemoMarkers(), center: { latitude: 37.7749, longitude: -122.4194 }, zoom: 11 },
      source: 'demo',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MapViewRequest = await request.json();
    const { action } = body;

    switch (action) {
      case 'get-markers': {
        const { filters, projectId } = body;
        let markers = getDemoMarkers();

        if (filters?.types?.length) {
          markers = markers.filter(m => filters.types!.includes(m.type));
        }
        if (filters?.statuses?.length) {
          markers = markers.filter(m => filters.statuses!.includes(m.status));
        }
        if (filters?.bounds) {
          const { north, south, east, west } = filters.bounds;
          markers = markers.filter(m =>
            m.location.latitude <= north &&
            m.location.latitude >= south &&
            m.location.longitude <= east &&
            m.location.longitude >= west
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            markers,
            total: markers.length,
          },
        });
      }

      case 'get-marker': {
        const { id } = body;
        const marker = getDemoMarkers().find(m => m.id === id);
        return NextResponse.json({
          success: true,
          data: marker || null,
        });
      }

      case 'create-marker': {
        const { data, location } = body;
        if (!location) {
          return NextResponse.json({ success: false, error: 'Location required' }, { status: 400 });
        }

        const newMarker: MapMarker = {
          id: `marker-${Date.now()}`,
          type: data?.type as MarkerType || 'task',
          label: data?.label || 'New Location',
          description: data?.description || null,
          location,
          status: 'pending',
          priority: 'medium',
          assignee_id: data?.assignee_id || null,
          assignee_name: data?.assignee_name || null,
          due_date: data?.due_date || null,
          color: data?.color || '#3b82f6',
          icon: data?.icon || 'pin',
          linked_id: data?.linked_id || `new-${Date.now()}`,
          metadata: data?.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: newMarker,
          message: 'Marker created successfully',
        });
      }

      case 'update-marker': {
        const { id, data } = body;
        if (!id) {
          return NextResponse.json({ success: false, error: 'Marker ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: { id, ...data, updated_at: new Date().toISOString() },
          message: 'Marker updated successfully',
        });
      }

      case 'delete-marker': {
        const { id } = body;
        if (!id) {
          return NextResponse.json({ success: false, error: 'Marker ID required' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          deleted: id,
          message: 'Marker deleted successfully',
        });
      }

      case 'get-team-locations': {
        const teamLocations = getDemoTeamLocations();
        return NextResponse.json({
          success: true,
          data: {
            locations: teamLocations,
            total: teamLocations.length,
            online_count: teamLocations.filter(t => t.status === 'online').length,
          },
        });
      }

      case 'get-client-locations': {
        const clients = getDemoMarkers().filter(m => m.type === 'client');
        return NextResponse.json({
          success: true,
          data: {
            clients,
            total: clients.length,
          },
        });
      }

      case 'calculate-route': {
        const { waypoints } = body;
        if (!waypoints || waypoints.length < 2) {
          return NextResponse.json({ success: false, error: 'At least 2 waypoints required' }, { status: 400 });
        }

        // Calculate total distance
        let totalDistance = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
          totalDistance += calculateDistance(waypoints[i], waypoints[i + 1]);
        }

        return NextResponse.json({
          success: true,
          data: {
            waypoints,
            total_distance_km: Math.round(totalDistance * 10) / 10,
            estimated_time_minutes: Math.round(totalDistance * 2), // Rough estimate
            optimized_order: waypoints, // In real implementation, use TSP algorithm
          },
        });
      }

      case 'find-nearest': {
        const { location, radius = 10, filters } = body;
        if (!location) {
          return NextResponse.json({ success: false, error: 'Location required' }, { status: 400 });
        }

        let markers = getDemoMarkers();
        if (filters?.types?.length) {
          markers = markers.filter(m => filters.types!.includes(m.type));
        }

        // Calculate distance and filter by radius
        const nearbyMarkers = markers
          .map(m => ({
            ...m,
            distance_km: calculateDistance(location, m.location),
          }))
          .filter(m => m.distance_km <= radius)
          .sort((a, b) => a.distance_km - b.distance_km);

        return NextResponse.json({
          success: true,
          data: {
            markers: nearbyMarkers,
            center: location,
            radius_km: radius,
            total: nearbyMarkers.length,
          },
        });
      }

      case 'get-area-tasks': {
        const { filters } = body;
        if (!filters?.bounds) {
          return NextResponse.json({ success: false, error: 'Bounds required' }, { status: 400 });
        }

        const { north, south, east, west } = filters.bounds;
        const tasksInArea = getDemoMarkers()
          .filter(m => m.type === 'task')
          .filter(m =>
            m.location.latitude <= north &&
            m.location.latitude >= south &&
            m.location.longitude <= east &&
            m.location.longitude >= west
          );

        return NextResponse.json({
          success: true,
          data: {
            tasks: tasksInArea,
            total: tasksInArea.length,
            bounds: filters.bounds,
          },
        });
      }

      case 'save-view': {
        const { data } = body;
        const savedView: MapViewConfig = {
          id: `view-${Date.now()}`,
          user_id: 'current-user',
          name: (data as Record<string, unknown>)?.name || 'Saved View',
          center: (data as Record<string, unknown>)?.center || { latitude: 37.7749, longitude: -122.4194 },
          zoom: (data as Record<string, unknown>)?.zoom || 11,
          filters: (data as Record<string, unknown>)?.filters || { types: [], statuses: [] },
          clustering_enabled: (data as Record<string, unknown>)?.clustering_enabled ?? true,
          show_routes: (data as Record<string, unknown>)?.show_routes ?? false,
          created_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: savedView,
          message: 'View saved successfully',
        });
      }

      case 'get-views': {
        const savedViews: MapViewConfig[] = [
          {
            id: 'view-1',
            user_id: 'current-user',
            name: 'All Tasks',
            center: { latitude: 37.7749, longitude: -122.4194 },
            zoom: 11,
            filters: { types: ['task'], statuses: ['pending', 'in_progress'] },
            clustering_enabled: true,
            show_routes: false,
            created_at: new Date().toISOString(),
          },
          {
            id: 'view-2',
            user_id: 'current-user',
            name: 'Team Locations',
            center: { latitude: 37.7749, longitude: -122.4194 },
            zoom: 10,
            filters: { types: ['team_member'], statuses: ['active'] },
            clustering_enabled: false,
            show_routes: true,
            created_at: new Date().toISOString(),
          },
        ];

        return NextResponse.json({
          success: true,
          data: savedViews,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    logger.error('Map View POST error', { error: err });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

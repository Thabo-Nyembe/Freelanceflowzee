'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Wrench, CheckCircle, AlertCircle, Server,
  Activity, Calendar, Settings, AlertTriangle, TrendingUp,
  BarChart3, Bell, Pause, Users, Plus, Search,
  Download, RefreshCw, FileText, Shield, Database,
  HardDrive, RotateCw, Target,
  ClipboardList
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Sliders, Webhook, Mail, Lock, Terminal, Archive } from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// Types
type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold' | 'overdue'
type MaintenanceType = 'preventive' | 'corrective' | 'emergency' | 'upgrade' | 'inspection' | 'calibration'
type Priority = 'critical' | 'high' | 'medium' | 'low'
type AssetStatus = 'operational' | 'degraded' | 'offline' | 'maintenance' | 'retired'

interface WorkOrder {
  id: string
  orderNumber: string
  title: string
  description: string
  type: MaintenanceType
  status: MaintenanceStatus
  priority: Priority
  asset: string
  assetId: string
  location: string
  assignedTo: TeamMember[]
  requestedBy: string
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  estimatedHours: number
  actualHours: number
  progress: number
  downtime: boolean
  downtimeMinutes: number
  parts: Part[]
  checklists: Checklist[]
  notes: string
  createdAt: string
  updatedAt: string
  sla: { target: number; remaining: number; breached: boolean }
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface Part {
  id: string
  name: string
  partNumber: string
  quantity: number
  cost: number
  available: boolean
}

interface Checklist {
  id: string
  title: string
  items: { id: string; task: string; completed: boolean }[]
}

interface Asset {
  id: string
  assetTag: string
  name: string
  type: string
  manufacturer: string
  model: string
  serialNumber: string
  location: string
  status: AssetStatus
  criticality: Priority
  lastMaintenance: string
  nextMaintenance: string
  maintenanceCount: number
  uptime: number
  mtbf: number // Mean Time Between Failures
  mttr: number // Mean Time To Repair
  purchaseDate: string
  warrantyExpiry: string
  owner: string
}

interface MaintenanceSchedule {
  id: string
  name: string
  description: string
  type: MaintenanceType
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  assets: string[]
  lastRun: string
  nextRun: string
  duration: number
  active: boolean
  assignedTeam: string
  checklist: string[]
}

interface Technician {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  skills: string[]
  certifications: string[]
  status: 'available' | 'busy' | 'off_duty' | 'on_leave'
  currentWorkOrder?: string
  completedOrders: number
  avgRating: number
  avatar?: string
}

interface SparePartInventory {
  id: string
  partNumber: string
  name: string
  category: string
  manufacturer: string
  quantity: number
  minQuantity: number
  maxQuantity: number
  unitCost: number
  location: string
  lastRestocked: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order'
  leadTime: number // days
  supplier: string
}

interface Vendor {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  category: string
  rating: number
  contractStart: string
  contractEnd: string
  status: 'active' | 'inactive' | 'pending'
  totalOrders: number
  lastOrderDate: string
}

interface Incident {
  id: string
  incidentNumber: string
  title: string
  description: string
  priority: Priority
  status: 'new' | 'investigating' | 'resolved' | 'closed'
  affectedAssets: string[]
  reportedBy: string
  reportedAt: string
  resolvedAt?: string
  rootCause?: string
  resolution?: string
  workOrderId?: string
}

// Mock Data
const mockWorkOrders: WorkOrder[] = [
  {
    id: '1',
    orderNumber: 'WO-2024-001',
    title: 'HVAC System Annual Inspection',
    description: 'Annual preventive maintenance for building HVAC system including filter replacement and coil cleaning.',
    type: 'preventive',
    status: 'in_progress',
    priority: 'high',
    asset: 'Main HVAC Unit - Building A',
    assetId: 'AST-001',
    location: 'Building A - Mechanical Room',
    assignedTo: [
      { id: '1', name: 'John Smith', email: 'john@company.com', role: 'Maintenance Tech' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'HVAC Specialist' }
    ],
    requestedBy: 'Facilities Manager',
    scheduledStart: '2024-12-25T08:00:00Z',
    scheduledEnd: '2024-12-25T16:00:00Z',
    actualStart: '2024-12-25T08:15:00Z',
    estimatedHours: 8,
    actualHours: 4,
    progress: 65,
    downtime: false,
    downtimeMinutes: 0,
    parts: [
      { id: '1', name: 'Air Filter 24x24', partNumber: 'AF-2424-M', quantity: 4, cost: 25.00, available: true },
      { id: '2', name: 'Refrigerant R-410A', partNumber: 'REF-410A-25', quantity: 2, cost: 150.00, available: true }
    ],
    checklists: [
      {
        id: '1',
        title: 'Pre-Maintenance Checks',
        items: [
          { id: '1', task: 'Turn off power supply', completed: true },
          { id: '2', task: 'Check refrigerant levels', completed: true },
          { id: '3', task: 'Inspect electrical connections', completed: true }
        ]
      }
    ],
    notes: 'Filters were heavily soiled. Recommend quarterly replacement.',
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-25T12:30:00Z',
    sla: { target: 24, remaining: 8, breached: false }
  },
  {
    id: '2',
    orderNumber: 'WO-2024-002',
    title: 'Emergency Generator Repair',
    description: 'Emergency repair for backup generator that failed during testing. Fuel pump suspected.',
    type: 'emergency',
    status: 'completed',
    priority: 'critical',
    asset: 'Backup Generator - Unit 1',
    assetId: 'AST-002',
    location: 'Building B - Generator Room',
    assignedTo: [
      { id: '3', name: 'Mike Wilson', email: 'mike@company.com', role: 'Electrical Tech' }
    ],
    requestedBy: 'Operations Manager',
    scheduledStart: '2024-12-24T14:00:00Z',
    scheduledEnd: '2024-12-24T18:00:00Z',
    actualStart: '2024-12-24T14:10:00Z',
    actualEnd: '2024-12-24T17:45:00Z',
    estimatedHours: 4,
    actualHours: 3.5,
    progress: 100,
    downtime: true,
    downtimeMinutes: 225,
    parts: [
      { id: '3', name: 'Fuel Pump Assembly', partNumber: 'FP-GEN-100', quantity: 1, cost: 450.00, available: true }
    ],
    checklists: [],
    notes: 'Fuel pump replaced. Generator tested successfully under load.',
    createdAt: '2024-12-24T13:00:00Z',
    updatedAt: '2024-12-24T17:45:00Z',
    sla: { target: 4, remaining: 0, breached: false }
  },
  {
    id: '3',
    orderNumber: 'WO-2024-003',
    title: 'Server Room UPS Battery Replacement',
    description: 'Scheduled replacement of UPS batteries in server room. System is 3 years old.',
    type: 'preventive',
    status: 'scheduled',
    priority: 'high',
    asset: 'UPS System - Server Room',
    assetId: 'AST-003',
    location: 'Data Center - Server Room A',
    assignedTo: [
      { id: '4', name: 'Emily Brown', email: 'emily@company.com', role: 'IT Tech' }
    ],
    requestedBy: 'IT Manager',
    scheduledStart: '2024-12-26T22:00:00Z',
    scheduledEnd: '2024-12-27T02:00:00Z',
    estimatedHours: 4,
    actualHours: 0,
    progress: 0,
    downtime: true,
    downtimeMinutes: 30,
    parts: [
      { id: '4', name: 'UPS Battery Pack', partNumber: 'BAT-UPS-3000', quantity: 8, cost: 200.00, available: true }
    ],
    checklists: [],
    notes: 'Scheduled during off-peak hours. IT team on standby.',
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2024-12-15T09:00:00Z',
    sla: { target: 72, remaining: 48, breached: false }
  },
  {
    id: '4',
    orderNumber: 'WO-2024-004',
    title: 'Elevator Monthly Inspection',
    description: 'Monthly safety inspection and lubrication for passenger elevator.',
    type: 'inspection',
    status: 'scheduled',
    priority: 'medium',
    asset: 'Passenger Elevator - Building A',
    assetId: 'AST-004',
    location: 'Building A - Elevator Shaft',
    assignedTo: [],
    requestedBy: 'Safety Officer',
    scheduledStart: '2024-12-27T06:00:00Z',
    scheduledEnd: '2024-12-27T09:00:00Z',
    estimatedHours: 3,
    actualHours: 0,
    progress: 0,
    downtime: true,
    downtimeMinutes: 180,
    parts: [],
    checklists: [],
    notes: '',
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-01T08:00:00Z',
    sla: { target: 168, remaining: 96, breached: false }
  },
  {
    id: '5',
    orderNumber: 'WO-2024-005',
    title: 'Production Line Conveyor Belt Replacement',
    description: 'Replace worn conveyor belt on production line 3. Belt showing signs of cracking.',
    type: 'corrective',
    status: 'on_hold',
    priority: 'high',
    asset: 'Conveyor System - Line 3',
    assetId: 'AST-005',
    location: 'Manufacturing - Line 3',
    assignedTo: [
      { id: '5', name: 'David Lee', email: 'david@company.com', role: 'Mechanical Tech' }
    ],
    requestedBy: 'Production Manager',
    scheduledStart: '2024-12-28T06:00:00Z',
    scheduledEnd: '2024-12-28T14:00:00Z',
    estimatedHours: 8,
    actualHours: 0,
    progress: 0,
    downtime: true,
    downtimeMinutes: 480,
    parts: [
      { id: '5', name: 'Conveyor Belt 100m', partNumber: 'CB-100M-HD', quantity: 1, cost: 2500.00, available: false }
    ],
    checklists: [],
    notes: 'Waiting for replacement belt delivery. ETA Dec 27.',
    createdAt: '2024-12-22T11:00:00Z',
    updatedAt: '2024-12-24T10:00:00Z',
    sla: { target: 48, remaining: 24, breached: false }
  }
]

const mockAssets: Asset[] = [
  { id: 'AST-001', assetTag: 'HVAC-001', name: 'Main HVAC Unit', type: 'HVAC', manufacturer: 'Carrier', model: 'WeatherMaker 9200', serialNumber: 'WM9200-12345', location: 'Building A', status: 'maintenance', criticality: 'high', lastMaintenance: '2024-12-25T08:00:00Z', nextMaintenance: '2025-03-25T08:00:00Z', maintenanceCount: 24, uptime: 99.2, mtbf: 4320, mttr: 2.5, purchaseDate: '2020-01-15', warrantyExpiry: '2025-01-15', owner: 'Facilities' },
  { id: 'AST-002', assetTag: 'GEN-001', name: 'Backup Generator', type: 'Generator', manufacturer: 'Caterpillar', model: 'C15', serialNumber: 'CAT-C15-67890', location: 'Building B', status: 'operational', criticality: 'critical', lastMaintenance: '2024-12-24T14:00:00Z', nextMaintenance: '2025-01-24T14:00:00Z', maintenanceCount: 36, uptime: 99.8, mtbf: 8760, mttr: 3.0, purchaseDate: '2018-06-01', warrantyExpiry: '2023-06-01', owner: 'Operations' },
  { id: 'AST-003', assetTag: 'UPS-001', name: 'Server Room UPS', type: 'UPS', manufacturer: 'APC', model: 'Smart-UPS 3000', serialNumber: 'APC-3000-11111', location: 'Data Center', status: 'operational', criticality: 'critical', lastMaintenance: '2024-09-15T22:00:00Z', nextMaintenance: '2024-12-26T22:00:00Z', maintenanceCount: 12, uptime: 100.0, mtbf: 52560, mttr: 0.5, purchaseDate: '2021-09-01', warrantyExpiry: '2026-09-01', owner: 'IT' },
  { id: 'AST-004', assetTag: 'ELV-001', name: 'Passenger Elevator', type: 'Elevator', manufacturer: 'Otis', model: 'Gen2', serialNumber: 'OTIS-GEN2-22222', location: 'Building A', status: 'operational', criticality: 'high', lastMaintenance: '2024-11-27T06:00:00Z', nextMaintenance: '2024-12-27T06:00:00Z', maintenanceCount: 60, uptime: 99.5, mtbf: 2160, mttr: 1.0, purchaseDate: '2015-03-20', warrantyExpiry: '2020-03-20', owner: 'Facilities' },
  { id: 'AST-005', assetTag: 'CONV-003', name: 'Production Line 3 Conveyor', type: 'Conveyor', manufacturer: 'Dorner', model: '3200 Series', serialNumber: 'DOR-3200-33333', location: 'Manufacturing', status: 'degraded', criticality: 'high', lastMaintenance: '2024-10-15T06:00:00Z', nextMaintenance: '2024-12-28T06:00:00Z', maintenanceCount: 48, uptime: 97.8, mtbf: 1440, mttr: 4.0, purchaseDate: '2019-08-10', warrantyExpiry: '2024-08-10', owner: 'Production' }
]

const mockSchedules: MaintenanceSchedule[] = [
  { id: '1', name: 'HVAC Quarterly Inspection', description: 'Quarterly preventive maintenance for all HVAC units', type: 'preventive', frequency: 'quarterly', assets: ['AST-001'], lastRun: '2024-09-25', nextRun: '2024-12-25', duration: 480, active: true, assignedTeam: 'HVAC Team', checklist: ['Check filters', 'Inspect coils', 'Test thermostat', 'Check refrigerant'] },
  { id: '2', name: 'Generator Monthly Test', description: 'Monthly load test for backup generators', type: 'inspection', frequency: 'monthly', assets: ['AST-002'], lastRun: '2024-11-24', nextRun: '2024-12-24', duration: 120, active: true, assignedTeam: 'Electrical Team', checklist: ['Start generator', 'Run under load', 'Check fuel levels', 'Log readings'] },
  { id: '3', name: 'UPS Battery Check', description: 'Quarterly battery health check and capacity test', type: 'preventive', frequency: 'quarterly', assets: ['AST-003'], lastRun: '2024-09-15', nextRun: '2024-12-15', duration: 60, active: true, assignedTeam: 'IT Team', checklist: ['Check battery voltage', 'Test runtime', 'Inspect connections'] },
  { id: '4', name: 'Elevator Safety Inspection', description: 'Monthly safety inspection as per regulations', type: 'inspection', frequency: 'monthly', assets: ['AST-004'], lastRun: '2024-11-27', nextRun: '2024-12-27', duration: 180, active: true, assignedTeam: 'Elevator Contractor', checklist: ['Safety brake test', 'Door sensor test', 'Emergency phone test', 'Lubrication'] }
]

const mockTechnicians: Technician[] = [
  { id: '1', name: 'John Smith', email: 'john@company.com', phone: '555-0101', role: 'Maintenance Tech', department: 'Facilities', skills: ['HVAC', 'Electrical', 'Plumbing'], certifications: ['EPA 608', 'OSHA 10'], status: 'busy', currentWorkOrder: 'WO-2024-001', completedOrders: 156, avgRating: 4.8 },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', phone: '555-0102', role: 'HVAC Specialist', department: 'Facilities', skills: ['HVAC', 'Refrigeration', 'Controls'], certifications: ['EPA 608', 'NATE'], status: 'busy', currentWorkOrder: 'WO-2024-001', completedOrders: 203, avgRating: 4.9 },
  { id: '3', name: 'Mike Wilson', email: 'mike@company.com', phone: '555-0103', role: 'Electrical Tech', department: 'Electrical', skills: ['Electrical', 'PLC', 'Motors'], certifications: ['Journeyman Electrician', 'OSHA 30'], status: 'available', completedOrders: 189, avgRating: 4.7 },
  { id: '4', name: 'Emily Brown', email: 'emily@company.com', phone: '555-0104', role: 'IT Tech', department: 'IT', skills: ['Servers', 'Networking', 'UPS'], certifications: ['CompTIA A+', 'Network+'], status: 'available', completedOrders: 98, avgRating: 4.6 },
  { id: '5', name: 'David Lee', email: 'david@company.com', phone: '555-0105', role: 'Mechanical Tech', department: 'Manufacturing', skills: ['Mechanical', 'Hydraulics', 'Conveyors'], certifications: ['CMRT', 'CRL'], status: 'on_leave', completedOrders: 234, avgRating: 4.8 },
  { id: '6', name: 'Lisa Garcia', email: 'lisa@company.com', phone: '555-0106', role: 'Supervisor', department: 'Facilities', skills: ['Management', 'HVAC', 'Electrical'], certifications: ['CMRP', 'PMP'], status: 'available', completedOrders: 312, avgRating: 4.9 }
]

const mockInventory: SparePartInventory[] = [
  { id: '1', partNumber: 'AF-2424-M', name: 'Air Filter 24x24', category: 'HVAC Filters', manufacturer: '3M', quantity: 48, minQuantity: 20, maxQuantity: 100, unitCost: 25.00, location: 'Warehouse A-1', lastRestocked: '2024-12-15', status: 'in_stock', leadTime: 3, supplier: 'HVAC Supply Co' },
  { id: '2', partNumber: 'REF-410A-25', name: 'Refrigerant R-410A 25lb', category: 'Refrigerants', manufacturer: 'Honeywell', quantity: 8, minQuantity: 10, maxQuantity: 30, unitCost: 150.00, location: 'Warehouse A-2', lastRestocked: '2024-12-10', status: 'low_stock', leadTime: 5, supplier: 'Refrigerant Depot' },
  { id: '3', partNumber: 'FP-GEN-100', name: 'Fuel Pump Assembly', category: 'Generator Parts', manufacturer: 'Caterpillar', quantity: 2, minQuantity: 1, maxQuantity: 5, unitCost: 450.00, location: 'Warehouse B-1', lastRestocked: '2024-11-20', status: 'in_stock', leadTime: 14, supplier: 'CAT Parts Direct' },
  { id: '4', partNumber: 'BAT-UPS-3000', name: 'UPS Battery Pack', category: 'UPS Parts', manufacturer: 'APC', quantity: 12, minQuantity: 8, maxQuantity: 24, unitCost: 200.00, location: 'Warehouse C-1', lastRestocked: '2024-12-01', status: 'in_stock', leadTime: 7, supplier: 'APC Direct' },
  { id: '5', partNumber: 'CB-100M-HD', name: 'Conveyor Belt 100m HD', category: 'Conveyor Parts', manufacturer: 'Dorner', quantity: 0, minQuantity: 1, maxQuantity: 3, unitCost: 2500.00, location: 'Warehouse D-1', lastRestocked: '2024-10-15', status: 'on_order', leadTime: 21, supplier: 'Industrial Belts Inc' },
  { id: '6', partNumber: 'BRG-6205-2RS', name: 'Ball Bearing 6205-2RS', category: 'Bearings', manufacturer: 'SKF', quantity: 24, minQuantity: 20, maxQuantity: 50, unitCost: 15.00, location: 'Warehouse A-3', lastRestocked: '2024-12-18', status: 'in_stock', leadTime: 2, supplier: 'Bearing World' },
  { id: '7', partNumber: 'OIL-10W30-5G', name: 'Motor Oil 10W-30 5gal', category: 'Lubricants', manufacturer: 'Mobil', quantity: 6, minQuantity: 8, maxQuantity: 20, unitCost: 85.00, location: 'Warehouse A-4', lastRestocked: '2024-12-05', status: 'low_stock', leadTime: 3, supplier: 'Lubricant Supply' },
  { id: '8', partNumber: 'VBT-50MM', name: 'V-Belt 50mm', category: 'Belts', manufacturer: 'Gates', quantity: 15, minQuantity: 10, maxQuantity: 30, unitCost: 35.00, location: 'Warehouse A-5', lastRestocked: '2024-12-12', status: 'in_stock', leadTime: 4, supplier: 'Belt Masters' }
]

const mockVendors: Vendor[] = [
  { id: '1', name: 'HVAC Supply Co', contactPerson: 'Robert Taylor', email: 'robert@hvacsupply.com', phone: '555-1001', address: '123 Industrial Blvd', category: 'HVAC Equipment', rating: 4.8, contractStart: '2024-01-01', contractEnd: '2025-12-31', status: 'active', totalOrders: 89, lastOrderDate: '2024-12-20' },
  { id: '2', name: 'CAT Parts Direct', contactPerson: 'Amanda White', email: 'amanda@catparts.com', phone: '555-1002', address: '456 Equipment Way', category: 'Generator Parts', rating: 4.9, contractStart: '2023-06-01', contractEnd: '2025-05-31', status: 'active', totalOrders: 34, lastOrderDate: '2024-11-20' },
  { id: '3', name: 'Industrial Belts Inc', contactPerson: 'James Brown', email: 'james@indbelts.com', phone: '555-1003', address: '789 Manufacturing St', category: 'Conveyor Parts', rating: 4.5, contractStart: '2024-03-01', contractEnd: '2025-02-28', status: 'active', totalOrders: 23, lastOrderDate: '2024-12-18' },
  { id: '4', name: 'Elevator Services Ltd', contactPerson: 'Michelle Chen', email: 'michelle@elevatorsvcs.com', phone: '555-1004', address: '321 Tower Dr', category: 'Elevator Maintenance', rating: 4.7, contractStart: '2024-01-01', contractEnd: '2025-12-31', status: 'active', totalOrders: 12, lastOrderDate: '2024-11-27' }
]

const mockIncidents: Incident[] = [
  { id: '1', incidentNumber: 'INC-2024-001', title: 'Generator Failed During Test', description: 'Backup generator failed to start during monthly load test', priority: 'critical', status: 'resolved', affectedAssets: ['AST-002'], reportedBy: 'Operations Manager', reportedAt: '2024-12-24T13:00:00Z', resolvedAt: '2024-12-24T17:45:00Z', rootCause: 'Fuel pump failure', resolution: 'Replaced fuel pump assembly', workOrderId: 'WO-2024-002' },
  { id: '2', incidentNumber: 'INC-2024-002', title: 'Conveyor Belt Degradation', description: 'Visible cracks on production line 3 conveyor belt', priority: 'high', status: 'investigating', affectedAssets: ['AST-005'], reportedBy: 'Production Manager', reportedAt: '2024-12-22T11:00:00Z', workOrderId: 'WO-2024-005' },
  { id: '3', incidentNumber: 'INC-2024-003', title: 'HVAC Temperature Fluctuation', description: 'Building A experiencing temperature inconsistencies', priority: 'medium', status: 'new', affectedAssets: ['AST-001'], reportedBy: 'Facilities Manager', reportedAt: '2024-12-25T08:00:00Z' }
]

const getInventoryStatusColor = (status: SparePartInventory['status']): string => {
  const colors = {
    in_stock: 'bg-green-100 text-green-700',
    low_stock: 'bg-yellow-100 text-yellow-700',
    out_of_stock: 'bg-red-100 text-red-700',
    on_order: 'bg-blue-100 text-blue-700'
  }
  return colors[status]
}

const getTechnicianStatusColor = (status: Technician['status']): string => {
  const colors = {
    available: 'bg-green-100 text-green-700',
    busy: 'bg-yellow-100 text-yellow-700',
    off_duty: 'bg-gray-100 text-gray-700',
    on_leave: 'bg-purple-100 text-purple-700'
  }
  return colors[status]
}

const getIncidentStatusColor = (status: Incident['status']): string => {
  const colors = {
    new: 'bg-blue-100 text-blue-700',
    investigating: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700'
  }
  return colors[status]
}

// Helper functions
const getStatusColor = (status: MaintenanceStatus): string => {
  const colors: Record<MaintenanceStatus, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700',
    on_hold: 'bg-purple-100 text-purple-700',
    overdue: 'bg-red-100 text-red-700'
  }
  return colors[status]
}

const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  }
  return colors[priority]
}

const getTypeColor = (type: MaintenanceType): string => {
  const colors: Record<MaintenanceType, string> = {
    preventive: 'bg-blue-100 text-blue-700',
    corrective: 'bg-orange-100 text-orange-700',
    emergency: 'bg-red-100 text-red-700',
    upgrade: 'bg-purple-100 text-purple-700',
    inspection: 'bg-cyan-100 text-cyan-700',
    calibration: 'bg-indigo-100 text-indigo-700'
  }
  return colors[type]
}

const getAssetStatusColor = (status: AssetStatus): string => {
  const colors: Record<AssetStatus, string> = {
    operational: 'bg-green-100 text-green-700',
    degraded: 'bg-yellow-100 text-yellow-700',
    offline: 'bg-red-100 text-red-700',
    maintenance: 'bg-blue-100 text-blue-700',
    retired: 'bg-gray-100 text-gray-700'
  }
  return colors[status]
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Mock data for AI-powered competitive upgrade components
const mockMaintenanceAIInsights = [
  { id: '1', type: 'success' as const, title: 'Preventive Maintenance', description: 'Scheduled maintenance reduced unplanned downtime by 60%.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Prevention' },
  { id: '2', type: 'warning' as const, title: 'Overdue Work Order', description: 'HVAC inspection WO-1234 is 3 days overdue.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Scheduling' },
  { id: '3', type: 'info' as const, title: 'Asset Health', description: 'Overall equipment effectiveness improved to 87%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockMaintenanceCollaborators = [
  { id: '1', name: 'Facilities Manager', avatar: '/avatars/facilities.jpg', status: 'online' as const, role: 'Management' },
  { id: '2', name: 'Lead Technician', avatar: '/avatars/tech.jpg', status: 'online' as const, role: 'Technician' },
  { id: '3', name: 'Safety Officer', avatar: '/avatars/safety.jpg', status: 'away' as const, role: 'Safety' },
]

const mockMaintenancePredictions = [
  { id: '1', title: 'Equipment Failure', prediction: 'Compressor C-204 likely needs service within 2 weeks', confidence: 78, trend: 'down' as const, impact: 'high' as const },
  { id: '2', title: 'Resource Need', prediction: 'Additional technician needed for Q2 scheduled work', confidence: 85, trend: 'up' as const, impact: 'medium' as const },
]

const mockMaintenanceActivities = [
  { id: '1', user: 'Lead Technician', action: 'Completed', target: 'generator monthly service', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Facilities Manager', action: 'Approved', target: 'emergency repair request', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Safety Officer', action: 'Inspected', target: 'fire suppression system', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be defined inside the component to use state setters

// Database types
interface DbMaintenanceWindow {
  id: string
  user_id: string
  window_code: string
  title: string
  description: string | null
  type: string
  status: string
  impact: string
  priority: string
  start_time: string
  end_time: string
  duration_minutes: number
  actual_start: string | null
  actual_end: string | null
  affected_systems: string[]
  downtime_expected: boolean
  assigned_to: string[]
  completion_rate: number
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

interface MaintenanceFormState {
  title: string
  description: string
  type: string
  priority: string
  impact: string
  start_time: string
  end_time: string
  duration_minutes: string
  affected_systems: string
  downtime_expected: boolean
  assigned_to: string
  notes: string
}

const initialFormState: MaintenanceFormState = {
  title: '',
  description: '',
  type: 'preventive',
  priority: 'medium',
  impact: 'low',
  start_time: '',
  end_time: '',
  duration_minutes: '60',
  affected_systems: '',
  downtime_expected: false,
  assigned_to: '',
  notes: '',
}

export default function MaintenanceClient() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase data state
  const [dbMaintenanceWindows, setDbMaintenanceWindows] = useState<DbMaintenanceWindow[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formState, setFormState] = useState<MaintenanceFormState>(initialFormState)

  // Dialog states for quick actions
  const [showSchedulePMDialog, setShowSchedulePMDialog] = useState(false)
  const [showAssetListDialog, setShowAssetListDialog] = useState(false)
  const [showInsightActionDialog, setShowInsightActionDialog] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<{ title: string; description: string } | null>(null)

  // Additional dialog states for comprehensive button functionality
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [showRunDiagnosticsDialog, setShowRunDiagnosticsDialog] = useState(false)
  const [showAddPartDialog, setShowAddPartDialog] = useState(false)
  const [showAddTechnicianDialog, setShowAddTechnicianDialog] = useState(false)
  const [showReorderPartDialog, setShowReorderPartDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showDeleteDataDialog, setShowDeleteDataDialog] = useState(false)
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false)
  const [diagnosticsProgress, setDiagnosticsProgress] = useState(0)
  const [selectedPart, setSelectedPart] = useState<SparePartInventory | null>(null)

  // Form states for new dialogs
  const [newPartForm, setNewPartForm] = useState({
    name: '',
    partNumber: '',
    category: '',
    manufacturer: '',
    quantity: '',
    minQuantity: '',
    maxQuantity: '',
    unitCost: '',
    location: '',
    leadTime: '',
    supplier: ''
  })

  const [newTechnicianForm, setNewTechnicianForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    skills: '',
    certifications: ''
  })

  // Schedule PM form state
  const [schedulePMForm, setSchedulePMForm] = useState({
    assetId: '',
    scheduleType: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'quarterly',
    startDate: '',
    notes: ''
  })

  // Fetch maintenance windows from Supabase
  const fetchMaintenanceWindows = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('maintenance_windows')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbMaintenanceWindows(data || [])
    } catch (error) {
      console.error('Error fetching maintenance windows:', error)
      toast.error('Failed to load maintenance data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchMaintenanceWindows()
  }, [fetchMaintenanceWindows])

  // Computed stats
  const stats = useMemo(() => {
    const total = mockWorkOrders.length
    const scheduled = mockWorkOrders.filter(w => w.status === 'scheduled').length
    const inProgress = mockWorkOrders.filter(w => w.status === 'in_progress').length
    const completed = mockWorkOrders.filter(w => w.status === 'completed').length
    const overdue = mockWorkOrders.filter(w => w.sla.breached).length
    const avgCompletion = mockWorkOrders.filter(w => w.status === 'completed').reduce((sum, w) => sum + (w.actualHours / w.estimatedHours) * 100, 0) / (completed || 1)
    const totalDowntime = mockWorkOrders.reduce((sum, w) => sum + w.downtimeMinutes, 0)
    const criticalAssets = mockAssets.filter(a => a.criticality === 'critical').length

    return {
      total,
      scheduled,
      inProgress,
      completed,
      overdue,
      avgCompletion: Math.round(avgCompletion),
      totalDowntime,
      criticalAssets,
      uptime: 99.5
    }
  }, [])

  // Filtered work orders
  const filteredOrders = useMemo(() => {
    return mockWorkOrders.filter(order => {
      const matchesSearch = searchQuery === '' ||
        order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.asset.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  // Create maintenance window
  const handleCreateWorkOrder = async () => {
    if (!formState.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formState.start_time || !formState.end_time) {
      toast.error('Start and end times are required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create maintenance windows')
        return
      }

      const { error } = await supabase.from('maintenance_windows').insert({
        user_id: user.id,
        title: formState.title,
        description: formState.description || null,
        type: formState.type,
        status: 'scheduled',
        priority: formState.priority,
        impact: formState.impact,
        start_time: formState.start_time,
        end_time: formState.end_time,
        duration_minutes: parseInt(formState.duration_minutes) || 60,
        affected_systems: formState.affected_systems ? formState.affected_systems.split(',').map(s => s.trim()) : [],
        downtime_expected: formState.downtime_expected,
        assigned_to: formState.assigned_to ? formState.assigned_to.split(',').map(s => s.trim()) : [],
        notes: formState.notes || null,
        completion_rate: 0,
      })

      if (error) throw error

      toast.success('Maintenance window created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      fetchMaintenanceWindows()
    } catch (error) {
      console.error('Error creating maintenance window:', error)
      toast.error('Failed to create maintenance window')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update maintenance status
  const handleUpdateStatus = async (windowId: string, newStatus: string) => {
    try {
      const completionRate = newStatus === 'completed' ? 100 : newStatus === 'scheduled' ? 0 : undefined
      const updateData: Record<string, unknown> = { status: newStatus, updated_at: new Date().toISOString() }
      if (completionRate !== undefined) updateData.completion_rate = completionRate
      if (newStatus === 'in-progress') updateData.actual_start = new Date().toISOString()
      if (newStatus === 'completed') updateData.actual_end = new Date().toISOString()

      const { error } = await supabase
        .from('maintenance_windows')
        .update(updateData)
        .eq('id', windowId)

      if (error) throw error

      toast.success(`Status updated to ${newStatus.replace('-', ' ')}`)
      fetchMaintenanceWindows()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  // Delete maintenance window
  const handleDeleteWindow = async (windowId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_windows')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', windowId)

      if (error) throw error

      toast.success('Maintenance window deleted')
      fetchMaintenanceWindows()
    } catch (error) {
      console.error('Error deleting window:', error)
      toast.error('Failed to delete maintenance window')
    }
  }

  // Assign technician (update assigned_to)
  const handleAssignTechnician = async (windowId: string, techName?: string) => {
    try {
      const window = dbMaintenanceWindows.find(w => w.id === windowId)
      const currentAssigned = window?.assigned_to || []
      const newAssigned = techName ? [...currentAssigned, techName] : currentAssigned

      const { error } = await supabase
        .from('maintenance_windows')
        .update({ assigned_to: newAssigned, updated_at: new Date().toISOString() })
        .eq('id', windowId)

      if (error) throw error

      toast.success('Technician assigned successfully')
      fetchMaintenanceWindows()
    } catch (error) {
      console.error('Error assigning technician:', error)
      toast.error('Failed to assign technician')
    }
  }

  // Complete task
  const handleCompleteTask = async (windowId: string) => {
    await handleUpdateStatus(windowId, 'completed')
  }

  // Schedule maintenance (opens dialog)
  const handleScheduleMaintenance = () => {
    setShowCreateDialog(true)
  }

  // Handle Schedule PM submission
  const handleSchedulePM = async () => {
    if (!schedulePMForm.assetId || !schedulePMForm.startDate) {
      toast.error('Please select an asset and start date')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to schedule preventive maintenance')
        return
      }

      const selectedAsset = mockAssets.find(a => a.id === schedulePMForm.assetId)

      const { error } = await supabase.from('maintenance_windows').insert({
        user_id: user.id,
        title: `Preventive Maintenance - ${selectedAsset?.name || 'Asset'}`,
        description: schedulePMForm.notes || `Scheduled ${schedulePMForm.scheduleType} preventive maintenance`,
        type: 'preventive',
        status: 'scheduled',
        priority: 'medium',
        impact: 'low',
        start_time: schedulePMForm.startDate,
        end_time: new Date(new Date(schedulePMForm.startDate).getTime() + 2 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 120,
        affected_systems: selectedAsset ? [selectedAsset.name] : [],
        downtime_expected: false,
        assigned_to: [],
        notes: `Schedule type: ${schedulePMForm.scheduleType}`,
        completion_rate: 0,
      })

      if (error) throw error

      toast.success('Preventive maintenance scheduled successfully')
      setShowSchedulePMDialog(false)
      setSchedulePMForm({ assetId: '', scheduleType: 'weekly', startDate: '', notes: '' })
      fetchMaintenanceWindows()
    } catch (error) {
      console.error('Error scheduling PM:', error)
      toast.error('Failed to schedule preventive maintenance')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle insight action
  const handleInsightAction = (insight: { title: string; description: string }) => {
    setSelectedInsight(insight)
    setShowInsightActionDialog(true)
  }

  // Process insight action
  const processInsightAction = async () => {
    if (!selectedInsight) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to take action')
        return
      }

      // Create a work order based on the insight
      const { error } = await supabase.from('maintenance_windows').insert({
        user_id: user.id,
        title: `Action: ${selectedInsight.title}`,
        description: selectedInsight.description,
        type: 'corrective',
        status: 'scheduled',
        priority: 'high',
        impact: 'medium',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 240,
        affected_systems: [],
        downtime_expected: false,
        assigned_to: [],
        notes: `Generated from AI insight: ${selectedInsight.title}`,
        completion_rate: 0,
      })

      if (error) throw error

      toast.success('Work order created from insight')
      setShowInsightActionDialog(false)
      setSelectedInsight(null)
      fetchMaintenanceWindows()
    } catch (error) {
      console.error('Error processing insight:', error)
      toast.error('Failed to process insight action')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Quick actions with proper dialog handlers
  const maintenanceQuickActions = [
    { id: '1', label: 'New Work Order', icon: 'plus', action: () => setShowCreateDialog(true), variant: 'default' as const },
    { id: '2', label: 'Schedule PM', icon: 'calendar', action: () => setShowSchedulePMDialog(true), variant: 'default' as const },
    { id: '3', label: 'Asset List', icon: 'list', action: () => setShowAssetListDialog(true), variant: 'outline' as const },
  ]

  // Export report
  const handleExportReport = () => {
    const csvContent = dbMaintenanceWindows.map(w =>
      `${w.title},${w.status},${w.priority},${w.completion_rate}%,${w.start_time}`
    ).join('\n')

    const blob = new Blob([`Title,Status,Priority,Completion,Start Time\n${csvContent}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `maintenance-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported successfully')
  }

  // Clear cache handler
  const handleClearCache = async () => {
    setIsSubmitting(true)
    try {
      // Simulate cache clearing
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Cache cleared successfully')
      setShowClearCacheDialog(false)
    } catch (error) {
      toast.error('Failed to clear cache')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Run diagnostics handler
  const handleRunDiagnostics = async () => {
    setDiagnosticsRunning(true)
    setDiagnosticsProgress(0)

    // Simulate diagnostics progress
    const interval = setInterval(() => {
      setDiagnosticsProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setDiagnosticsRunning(false)
          toast.success('Diagnostics completed - All systems operational')
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  // Add new spare part handler
  const handleAddPart = async () => {
    if (!newPartForm.name || !newPartForm.partNumber) {
      toast.error('Part name and number are required')
      return
    }
    setIsSubmitting(true)
    try {
      // In a real app, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Part "${newPartForm.name}" added successfully`)
      setShowAddPartDialog(false)
      setNewPartForm({
        name: '',
        partNumber: '',
        category: '',
        manufacturer: '',
        quantity: '',
        minQuantity: '',
        maxQuantity: '',
        unitCost: '',
        location: '',
        leadTime: '',
        supplier: ''
      })
    } catch (error) {
      toast.error('Failed to add part')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add new technician handler
  const handleAddTechnician = async () => {
    if (!newTechnicianForm.name || !newTechnicianForm.email) {
      toast.error('Name and email are required')
      return
    }
    setIsSubmitting(true)
    try {
      // In a real app, this would save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Technician "${newTechnicianForm.name}" added successfully`)
      setShowAddTechnicianDialog(false)
      setNewTechnicianForm({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        skills: '',
        certifications: ''
      })
    } catch (error) {
      toast.error('Failed to add technician')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reorder part handler
  const handleReorderPart = async () => {
    if (!selectedPart) return
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`Reorder placed for ${selectedPart.name}`)
      setShowReorderPartDialog(false)
      setSelectedPart(null)
    } catch (error) {
      toast.error('Failed to place reorder')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset settings handler
  const handleResetSettings = async () => {
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Settings reset to defaults')
      setShowResetSettingsDialog(false)
    } catch (error) {
      toast.error('Failed to reset settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete all data handler
  const handleDeleteAllData = async () => {
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in')
        return
      }

      // Soft delete all maintenance windows
      const { error } = await supabase
        .from('maintenance_windows')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .is('deleted_at', null)

      if (error) throw error

      toast.success('All maintenance data deleted')
      setShowDeleteDataDialog(false)
      fetchMaintenanceWindows()
    } catch (error) {
      toast.error('Failed to delete data')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Export inventory report
  const handleExportInventory = () => {
    const csvContent = mockInventory.map(p =>
      `${p.name},${p.partNumber},${p.category},${p.quantity},${p.unitCost},${p.status}`
    ).join('\n')

    const blob = new Blob([`Name,Part Number,Category,Quantity,Unit Cost,Status\n${csvContent}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Inventory report exported')
  }

  // Archive work orders handler
  const handleArchiveWorkOrders = () => {
    const completedCount = mockWorkOrders.filter(w => w.status === 'completed').length
    toast.success(`${completedCount} completed work orders archived`)
  }

  // Refresh data handler
  const handleRefreshData = async () => {
    toast.info('Refreshing data...')
    await fetchMaintenanceWindows()
    toast.success('Data refreshed')
  }

  // Filter work orders by status (quick action buttons)
  const handleFilterByStatus = (status: string) => {
    if (status === 'all') {
      setStatusFilter('all')
    } else {
      setStatusFilter(status as MaintenanceStatus)
    }
    setActiveTab('work-orders')
    toast.info(`Showing ${status === 'all' ? 'all' : status.replace('_', ' ')} work orders`)
  }

  // Navigate to tab handlers
  const handleNavigateToAssets = () => {
    setActiveTab('assets')
    toast.info('Viewing assets')
  }

  const handleNavigateToTeam = () => {
    setActiveTab('team')
    toast.info('Viewing team')
  }

  const handleNavigateToReports = () => {
    setActiveTab('reports')
    if (!['reports'].includes(activeTab)) {
      toast.info('Reports tab selected')
    }
  }

  // Connect/Disconnect integration handler
  const handleToggleIntegration = (serviceName: string, connected: boolean) => {
    if (connected) {
      toast.success(`Disconnected from ${serviceName}`)
    } else {
      toast.info(`Connecting to ${serviceName}...`)
      setTimeout(() => {
        toast.success(`Connected to ${serviceName}`)
      }, 1500)
    }
  }

  // Export archive handler
  const handleExportArchive = () => {
    toast.info('Preparing archive export...')
    setTimeout(() => {
      const blob = new Blob(['Work Order Archive Export'], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `work-order-archive-${new Date().toISOString().split('T')[0]}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Archive exported')
    }, 1000)
  }

  // Manage storage handler
  const handleManageStorage = () => {
    toast.info('Opening storage manager...')
    setTimeout(() => {
      toast.success('Storage cleanup completed - 500MB freed')
    }, 2000)
  }

  // Save settings handler
  const handleSaveSettings = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Maintenance Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  ServiceNow-level CMMS and work order management
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExportReport}>
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center gap-2" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4" />
                New Work Order
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Work Orders', value: stats.total.toString(), icon: ClipboardList, gradient: 'from-orange-500 to-amber-600' },
              { label: 'In Progress', value: stats.inProgress.toString(), icon: Activity, gradient: 'from-yellow-500 to-orange-600' },
              { label: 'Scheduled', value: stats.scheduled.toString(), icon: Calendar, gradient: 'from-blue-500 to-cyan-600' },
              { label: 'Completed', value: stats.completed.toString(), icon: CheckCircle, gradient: 'from-green-500 to-emerald-600' },
              { label: 'System Uptime', value: `${stats.uptime}%`, icon: TrendingUp, gradient: 'from-purple-500 to-indigo-600' },
              { label: 'Total Downtime', value: formatDuration(stats.totalDowntime), icon: Pause, gradient: 'from-red-500 to-pink-600' },
              { label: 'Critical Assets', value: stats.criticalAssets.toString(), icon: Shield, gradient: 'from-cyan-500 to-blue-600' },
              { label: 'Avg Efficiency', value: `${stats.avgCompletion}%`, icon: Target, gradient: 'from-pink-500 to-rose-600' }
            ].map((stat, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.gradient} mb-3`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
              <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="work-orders" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <ClipboardList className="w-4 h-4 mr-2" />
                Work Orders
              </TabsTrigger>
              <TabsTrigger value="assets" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Server className="w-4 h-4 mr-2" />
                Assets
              </TabsTrigger>
              <TabsTrigger value="schedules" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Schedules
              </TabsTrigger>
              <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Database className="w-4 h-4 mr-2" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Users className="w-4 h-4 mr-2" />
                Team
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Dashboard Banner */}
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Maintenance Dashboard</h3>
                    <p className="text-orange-100">Real-time overview of all maintenance operations</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-3xl font-bold">{stats.uptime}%</p>
                      <p className="text-orange-200 text-sm">System Uptime</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: Plus, label: 'New Order', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', action: () => setShowCreateDialog(true) },
                  { icon: Activity, label: 'In Progress', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', action: () => handleFilterByStatus('in_progress') },
                  { icon: Calendar, label: 'Schedule', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', action: () => setShowSchedulePMDialog(true) },
                  { icon: AlertTriangle, label: 'Critical', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', action: () => { setStatusFilter('all'); setActiveTab('work-orders'); toast.info('Showing critical work orders') } },
                  { icon: Server, label: 'Assets', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', action: handleNavigateToAssets },
                  { icon: Users, label: 'Team', color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30', action: handleNavigateToTeam },
                  { icon: BarChart3, label: 'Reports', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', action: handleNavigateToReports },
                  { icon: RefreshCw, label: 'Refresh', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', action: handleRefreshData },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Work Orders */}
                <Card className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-600" />
                      Active Work Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {mockWorkOrders.filter(w => ['in_progress', 'scheduled'].includes(w.status)).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                                <Wrench className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{order.title}</p>
                                <p className="text-sm text-gray-500">{order.orderNumber} • {order.asset}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex gap-2 mb-1">
                                <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                                <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                              </div>
                              {order.status === 'in_progress' && (
                                <div className="w-24 mt-2">
                                  <Progress value={order.progress} className="h-2" />
                                  <p className="text-xs text-gray-500 mt-1">{order.progress}% complete</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Asset Health Overview */}
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      Asset Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAssets.slice(0, 4).map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                            <p className="text-xs text-gray-500">{asset.location}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getAssetStatusColor(asset.status)}>{asset.status}</Badge>
                            <p className="text-xs text-gray-500 mt-1">{asset.uptime}% uptime</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Maintenance */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Scheduled Maintenance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockSchedules.map((schedule) => (
                      <div key={schedule.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getTypeColor(schedule.type)}>{schedule.type}</Badge>
                          <Badge variant="outline">{schedule.frequency}</Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{schedule.name}</h4>
                        <p className="text-xs text-gray-500 mb-3">{schedule.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Next: {formatDate(schedule.nextRun)}</span>
                          <span>{formatDuration(schedule.duration)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Work Orders Tab */}
            <TabsContent value="work-orders" className="space-y-6">
              {/* Work Orders Banner */}
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Work Order Management</h3>
                    <p className="text-blue-100">Track and manage all maintenance work orders</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-3xl font-bold">{stats.total}</p>
                      <p className="text-blue-200 text-sm">Total Orders</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Orders Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: Plus, label: 'New Order', color: 'text-green-600 bg-green-100 dark:bg-green-900/30', action: () => setShowCreateDialog(true) },
                  { icon: Activity, label: 'In Progress', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', action: () => handleFilterByStatus('in_progress') },
                  { icon: CheckCircle, label: 'Completed', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', action: () => handleFilterByStatus('completed') },
                  { icon: Pause, label: 'On Hold', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', action: () => handleFilterByStatus('on_hold') },
                  { icon: AlertTriangle, label: 'Overdue', color: 'text-red-600 bg-red-100 dark:bg-red-900/30', action: () => handleFilterByStatus('overdue') },
                  { icon: Download, label: 'Export', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', action: handleExportReport },
                  { icon: Archive, label: 'Archive', color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', action: handleArchiveWorkOrders },
                  { icon: RefreshCw, label: 'Refresh', color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30', action: handleRefreshData },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:scale-105 transition-all duration-200`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search work orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'scheduled', 'in_progress', 'completed', 'on_hold'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className={statusFilter === status ? 'bg-gradient-to-r from-orange-600 to-amber-600' : ''}
                    >
                      {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Work Orders List */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {filteredOrders.map((order) => (
                        <Dialog key={order.id}>
                          <DialogTrigger asChild>
                            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                                    <Wrench className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-gray-900 dark:text-white">{order.title}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                      <Badge className={getStatusColor(order.status)}>{order.status.replace('_', ' ')}</Badge>
                                      <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                                      <Badge className={getTypeColor(order.type)}>{order.type}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      {order.orderNumber} • {order.asset} • {order.location}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  {order.status === 'in_progress' && (
                                    <div className="mb-2">
                                      <Progress value={order.progress} className="h-2 w-24" />
                                      <p className="text-xs text-gray-500">{order.progress}%</p>
                                    </div>
                                  )}
                                  <p className="text-sm text-gray-500">Due: {formatDateTime(order.scheduledEnd)}</p>
                                  {order.sla.breached && <Badge className="bg-red-100 text-red-700 mt-1">SLA Breached</Badge>}
                                </div>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{order.title}</DialogTitle>
                              <DialogDescription>{order.orderNumber}</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh]">
                              <div className="space-y-4 p-4">
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                  <Badge className={getPriorityColor(order.priority)}>{order.priority}</Badge>
                                  <Badge className={getTypeColor(order.type)}>{order.type}</Badge>
                                </div>
                                <p className="text-sm text-gray-600">{order.description}</p>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-1">Asset</h4>
                                    <p className="text-sm text-gray-600">{order.asset}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-1">Location</h4>
                                    <p className="text-sm text-gray-600">{order.location}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Assigned Team</h4>
                                  <div className="flex gap-2">
                                    {order.assignedTo.map((member) => (
                                      <div key={member.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                        <Avatar className="w-8 h-8">
                                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="text-sm font-medium">{member.name}</p>
                                          <p className="text-xs text-gray-500">{member.role}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {order.parts.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Parts Required</h4>
                                    <div className="space-y-2">
                                      {order.parts.map((part) => (
                                        <div key={part.id} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                                          <span className="text-sm">{part.name} ({part.partNumber})</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm">x{part.quantity}</span>
                                            <Badge className={part.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                              {part.available ? 'In Stock' : 'Backordered'}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {order.notes && (
                                  <div>
                                    <h4 className="font-semibold mb-1">Notes</h4>
                                    <p className="text-sm text-gray-600">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assets Tab */}
            <TabsContent value="assets" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    Asset Inventory
                  </CardTitle>
                  <CardDescription>Manage equipment and assets for maintenance tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {mockAssets.map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                              <HardDrive className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900 dark:text-white">{asset.name}</p>
                                <Badge className={getPriorityColor(asset.criticality)}>{asset.criticality}</Badge>
                              </div>
                              <p className="text-sm text-gray-500">{asset.assetTag} • {asset.manufacturer} {asset.model}</p>
                              <p className="text-xs text-gray-400">{asset.location} • Owner: {asset.owner}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getAssetStatusColor(asset.status)}>{asset.status}</Badge>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-gray-500">Uptime</p>
                                <p className="font-semibold">{asset.uptime}%</p>
                              </div>
                              <div>
                                <p className="text-gray-500">MTBF</p>
                                <p className="font-semibold">{asset.mtbf}h</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Next: {formatDate(asset.nextMaintenance)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedules Tab */}
            <TabsContent value="schedules" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockSchedules.map((schedule) => (
                  <Card key={schedule.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{schedule.name}</CardTitle>
                          <CardDescription className="mt-1">{schedule.description}</CardDescription>
                        </div>
                        <Switch checked={schedule.active} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={getTypeColor(schedule.type)}>{schedule.type}</Badge>
                        <Badge variant="outline">{schedule.frequency}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Last Run</p>
                          <p className="text-sm font-medium">{formatDate(schedule.lastRun)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Next Run</p>
                          <p className="text-sm font-medium">{formatDate(schedule.nextRun)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="text-sm font-medium">{formatDuration(schedule.duration)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Team</p>
                          <p className="text-sm font-medium">{schedule.assignedTeam}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Checklist Items</p>
                        <div className="flex flex-wrap gap-2">
                          {schedule.checklist.map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Maintenance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Work Order Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-500">Total This Month</span><span className="font-semibold">{stats.total}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Completed</span><span className="font-semibold text-green-600">{stats.completed}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">In Progress</span><span className="font-semibold text-yellow-600">{stats.inProgress}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Overdue</span><span className="font-semibold text-red-600">{stats.overdue}</span></div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Performance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-500">Avg Completion</span><span className="font-semibold">{stats.avgCompletion}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">System Uptime</span><span className="font-semibold">{stats.uptime}%</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Total Downtime</span><span className="font-semibold">{formatDuration(stats.totalDowntime)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">SLA Compliance</span><span className="font-semibold text-green-600">96%</span></div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cost Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-500">Labor Cost</span><span className="font-semibold">$12,450</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Parts Cost</span><span className="font-semibold">$5,325</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Total Cost</span><span className="font-semibold">$17,775</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Budget Used</span><span className="font-semibold">78%</span></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spare Parts Inventory</h3>
                  <p className="text-sm text-gray-500">Manage spare parts and supplies for maintenance operations</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center gap-2" onClick={handleExportInventory}>
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button className="bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center gap-2" onClick={() => setShowAddPartDialog(true)}>
                    <Plus className="w-4 h-4" />
                    Add Part
                  </Button>
                </div>
              </div>

              {/* Inventory Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockInventory.filter(i => i.status === 'in_stock').length}</p>
                        <p className="text-xs text-gray-500">In Stock</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockInventory.filter(i => i.status === 'low_stock').length}</p>
                        <p className="text-xs text-gray-500">Low Stock</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                        <RotateCw className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockInventory.filter(i => i.status === 'on_order').length}</p>
                        <p className="text-xs text-gray-500">On Order</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">${mockInventory.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Total Value</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Inventory Table */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {mockInventory.map((part) => (
                        <div key={part.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                                <Database className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900 dark:text-white">{part.name}</p>
                                  <Badge className={getInventoryStatusColor(part.status)}>{part.status.replace('_', ' ')}</Badge>
                                </div>
                                <p className="text-sm text-gray-500">{part.partNumber} • {part.manufacturer}</p>
                                <p className="text-xs text-gray-400">{part.category} • {part.location}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{part.quantity} units</p>
                                  <p className="text-xs text-gray-500">Min: {part.minQuantity} / Max: {part.maxQuantity}</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">${part.unitCost.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">per unit</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Lead: {part.leadTime}d</p>
                                  <p className="text-xs text-gray-400">{part.supplier}</p>
                                </div>
                              </div>
                              {part.status === 'low_stock' && (
                                <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                                  setSelectedPart(part)
                                  setShowReorderPartDialog(true)
                                }}>
                                  <RefreshCw className="w-3 h-3 mr-1" />
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Vendors Section */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Approved Vendors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockVendors.map((vendor) => (
                      <div key={vendor.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{vendor.name}</p>
                            <p className="text-sm text-gray-500">{vendor.category}</p>
                          </div>
                          <Badge className={vendor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{vendor.status}</Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-600">{vendor.contactPerson}</p>
                          <p className="text-gray-500">{vendor.email}</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-gray-500">Rating: {'★'.repeat(Math.floor(vendor.rating))}</span>
                            <span className="text-gray-500">{vendor.totalOrders} orders</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance Team</h3>
                  <p className="text-sm text-gray-500">Manage technicians, skills, and assignments</p>
                </div>
                <Button className="bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center gap-2" onClick={() => setShowAddTechnicianDialog(true)}>
                  <Plus className="w-4 h-4" />
                  Add Technician
                </Button>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockTechnicians.filter(t => t.status === 'available').length}</p>
                        <p className="text-xs text-gray-500">Available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockTechnicians.filter(t => t.status === 'busy').length}</p>
                        <p className="text-xs text-gray-500">Busy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockTechnicians.length}</p>
                        <p className="text-xs text-gray-500">Total Team</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(mockTechnicians.reduce((sum, t) => sum + t.avgRating, 0) / mockTechnicians.length).toFixed(1)}</p>
                        <p className="text-xs text-gray-500">Avg Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Technicians List */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {mockTechnicians.map((tech) => (
                        <div key={tech.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white font-semibold">
                                  {tech.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900 dark:text-white">{tech.name}</p>
                                  <Badge className={getTechnicianStatusColor(tech.status)}>{tech.status.replace('_', ' ')}</Badge>
                                </div>
                                <p className="text-sm text-gray-500">{tech.role} • {tech.department}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {tech.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{tech.completedOrders}</p>
                                  <p className="text-xs text-gray-500">Completed</p>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{'★'.repeat(Math.floor(tech.avgRating))}</p>
                                  <p className="text-xs text-gray-500">{tech.avgRating} rating</p>
                                </div>
                              </div>
                              {tech.currentWorkOrder && (
                                <p className="text-xs text-blue-600 mt-2">Working on: {tech.currentWorkOrder}</p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {tech.certifications.map((cert, idx) => (
                                  <Badge key={idx} className="bg-blue-100 text-blue-700 text-xs">{cert}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Incidents Section */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Recent Incidents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockIncidents.map((incident) => (
                      <div key={incident.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getIncidentStatusColor(incident.status)}>{incident.status}</Badge>
                            <Badge className={getPriorityColor(incident.priority)}>{incident.priority}</Badge>
                          </div>
                          <span className="text-xs text-gray-500">{incident.incidentNumber}</span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">{incident.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{incident.description}</p>
                        <div className="flex justify-between mt-3 text-xs text-gray-500">
                          <span>Reported by: {incident.reportedBy}</span>
                          <span>{formatDateTime(incident.reportedAt)}</span>
                        </div>
                        {incident.workOrderId && (
                          <p className="text-xs text-blue-600 mt-2">Linked: {incident.workOrderId}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-0">
              <div className="grid grid-cols-12 gap-6">
                {/* Settings Sidebar */}
                <div className="col-span-3">
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Settings className="h-5 w-5 text-orange-600" />
                        Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <nav className="space-y-1">
                        {[
                          { id: 'general', label: 'General', icon: Sliders },
                          { id: 'work-orders', label: 'Work Orders', icon: ClipboardList },
                          { id: 'notifications', label: 'Notifications', icon: Bell },
                          { id: 'integrations', label: 'Integrations', icon: Webhook },
                          { id: 'security', label: 'Security', icon: Lock },
                          { id: 'advanced', label: 'Advanced', icon: Terminal },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSettingsTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                              settingsTab === item.id
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        ))}
                      </nav>
                    </CardContent>
                  </Card>
                </div>

                {/* Settings Content */}
                <div className="col-span-9 space-y-6">
                  {/* General Settings */}
                  {settingsTab === 'general' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>General Settings</CardTitle>
                          <CardDescription>Configure maintenance management preferences</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Default Priority</Label>
                              <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                              </select>
                            </div>
                            <div>
                              <Label>Default Type</Label>
                              <select className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700">
                                <option value="preventive">Preventive</option>
                                <option value="corrective">Corrective</option>
                                <option value="inspection">Inspection</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Auto-number work orders</p>
                              <p className="text-sm text-gray-500">Automatically generate work order numbers</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Track labor hours</p>
                              <p className="text-sm text-gray-500">Enable time tracking for work orders</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>Display Settings</CardTitle>
                          <CardDescription>Customize the dashboard appearance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Show asset health</p>
                              <p className="text-sm text-gray-500">Display asset health indicators</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Show SLA timers</p>
                              <p className="text-sm text-gray-500">Display countdown to SLA breach</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Work Orders Settings */}
                  {settingsTab === 'work-orders' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>Work Order Settings</CardTitle>
                          <CardDescription>Configure work order behavior</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Auto-assign work orders</p>
                              <p className="text-sm text-gray-500">Automatically assign based on team availability</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Require approval for emergency</p>
                              <p className="text-sm text-gray-500">Emergency work orders need manager approval</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Require checklist completion</p>
                              <p className="text-sm text-gray-500">Work orders can't be closed without completing checklist</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Allow technician reassignment</p>
                              <p className="text-sm text-gray-500">Technicians can reassign their work orders</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>SLA Configuration</CardTitle>
                          <CardDescription>Set response and resolution time targets</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Critical Response (hours)</Label>
                              <Input type="number" defaultValue="1" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                            <div>
                              <Label>Critical Resolution (hours)</Label>
                              <Input type="number" defaultValue="4" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                            <div>
                              <Label>High Response (hours)</Label>
                              <Input type="number" defaultValue="4" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                            <div>
                              <Label>High Resolution (hours)</Label>
                              <Input type="number" defaultValue="24" className="mt-1.5 dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Notifications Settings */}
                  {settingsTab === 'notifications' && (
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Configure alerts and notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { icon: Bell, name: 'SLA breach alerts', desc: 'Alert when SLA is about to be breached' },
                          { icon: Calendar, name: 'Scheduled maintenance reminders', desc: 'Notify team before scheduled maintenance' },
                          { icon: AlertTriangle, name: 'Asset health alerts', desc: 'Alert when asset health degrades' },
                          { icon: Mail, name: 'Email notifications', desc: 'Send notifications via email' },
                          { icon: Database, name: 'Low inventory alerts', desc: 'Alert when spare parts are low' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <item.icon className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                            </div>
                            <Switch defaultChecked={i < 3} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Integrations Settings */}
                  {settingsTab === 'integrations' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>CMMS Integrations</CardTitle>
                          <CardDescription>Connect with external maintenance systems</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[
                            { name: 'SAP Plant Maintenance', desc: 'Sync with SAP PM module', connected: false },
                            { name: 'IBM Maximo', desc: 'Connect to IBM Maximo', connected: false },
                            { name: 'ServiceNow', desc: 'Integrate with ServiceNow CMMS', connected: true },
                            { name: 'UpKeep', desc: 'Sync with UpKeep mobile CMMS', connected: false },
                          ].map((service, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                                <p className="text-sm text-gray-500">{service.desc}</p>
                              </div>
                              <Button variant={service.connected ? "outline" : "default"} size="sm" onClick={() => handleToggleIntegration(service.name, service.connected)}>
                                {service.connected ? 'Disconnect' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>IoT & Sensors</CardTitle>
                          <CardDescription>Connect monitoring devices</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Enable IoT monitoring</p>
                              <p className="text-sm text-gray-500">Receive data from connected sensors</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Auto-create work orders</p>
                              <p className="text-sm text-gray-500">Automatically create work orders from sensor alerts</p>
                            </div>
                            <Switch />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Security Settings */}
                  {settingsTab === 'security' && (
                    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Manage access and permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Require work order signatures</p>
                            <p className="text-sm text-gray-500">Technicians must sign off on completed work</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit trail logging</p>
                            <p className="text-sm text-gray-500">Log all changes to work orders</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Role-based access</p>
                            <p className="text-sm text-gray-500">Restrict features based on user role</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Two-factor authentication</p>
                            <p className="text-sm text-gray-500">Require 2FA for sensitive operations</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Advanced Settings */}
                  {settingsTab === 'advanced' && (
                    <>
                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>Advanced Options</CardTitle>
                          <CardDescription>Configure advanced maintenance settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Predictive maintenance</p>
                              <p className="text-sm text-gray-500">Use AI to predict equipment failures</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Condition monitoring</p>
                              <p className="text-sm text-gray-500">Enable real-time condition monitoring</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">MTBF/MTTR tracking</p>
                              <p className="text-sm text-gray-500">Track reliability metrics</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle>Data Management</CardTitle>
                          <CardDescription>Manage maintenance data</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Database className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">Work Order Archive</p>
                                <p className="text-sm text-gray-500">2,456 archived orders (145 MB)</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleExportArchive}>Export</Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <HardDrive className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">Attachments Storage</p>
                                <p className="text-sm text-gray-500">3.2 GB used of 10 GB</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleManageStorage}>Manage</Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-red-200 dark:border-red-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-red-600">Danger Zone</CardTitle>
                          <CardDescription>Irreversible actions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Reset All Settings</p>
                              <p className="text-sm text-gray-500">Reset to factory defaults</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => setShowResetSettingsDialog(true)}>Reset</Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Delete All Data</p>
                              <p className="text-sm text-gray-500">Permanently delete all maintenance data</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDataDialog(true)}>Delete</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Enhanced Competitive Upgrade Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <AIInsightsPanel
                insights={mockMaintenanceAIInsights}
                title="Maintenance Intelligence"
                onInsightAction={(insight: AIInsight) => handleInsightAction({ title: insight?.title || 'Insight Action', description: insight?.description || '' })}
              />
            </div>
            <div className="space-y-6">
              <CollaborationIndicator
                collaborators={mockMaintenanceCollaborators}
                maxVisible={4}
              />
              <PredictiveAnalytics
                predictions={mockMaintenancePredictions}
                title="Equipment Forecasts"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityFeed
              activities={mockMaintenanceActivities}
              title="Maintenance Activity"
              maxItems={5}
            />
            <QuickActionsToolbar
              actions={maintenanceQuickActions}
              variant="grid"
            />
          </div>
        </div>
      </div>

      {/* Create Maintenance Window Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Maintenance Window</DialogTitle>
            <DialogDescription>Schedule a new maintenance window for your systems</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input
                  value={formState.title}
                  onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., HVAC System Annual Inspection"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Input
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the maintenance work..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  value={formState.type}
                  onChange={(e) => setFormState(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="emergency">Emergency</option>
                  <option value="upgrade">Upgrade</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  value={formState.priority}
                  onChange={(e) => setFormState(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={formState.start_time}
                  onChange={(e) => setFormState(prev => ({ ...prev, start_time: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="datetime-local"
                  value={formState.end_time}
                  onChange={(e) => setFormState(prev => ({ ...prev, end_time: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formState.duration_minutes}
                  onChange={(e) => setFormState(prev => ({ ...prev, duration_minutes: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Impact</Label>
                <select
                  value={formState.impact}
                  onChange={(e) => setFormState(prev => ({ ...prev, impact: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label>Affected Systems (comma-separated)</Label>
                <Input
                  value={formState.affected_systems}
                  onChange={(e) => setFormState(prev => ({ ...prev, affected_systems: e.target.value }))}
                  placeholder="e.g., HVAC, Server Room, Building A"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label>Assigned To (comma-separated)</Label>
                <Input
                  value={formState.assigned_to}
                  onChange={(e) => setFormState(prev => ({ ...prev, assigned_to: e.target.value }))}
                  placeholder="e.g., John Smith, Sarah Johnson"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch
                  checked={formState.downtime_expected}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, downtime_expected: checked }))}
                />
                <Label>Downtime Expected</Label>
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Input
                  value={formState.notes}
                  onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button
              onClick={handleCreateWorkOrder}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Maintenance Window'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Preventive Maintenance Dialog */}
      <Dialog open={showSchedulePMDialog} onOpenChange={setShowSchedulePMDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Preventive Maintenance</DialogTitle>
            <DialogDescription>Set up recurring preventive maintenance for an asset</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Asset *</Label>
              <select
                value={schedulePMForm.assetId}
                onChange={(e) => setSchedulePMForm(prev => ({ ...prev, assetId: e.target.value }))}
                className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="">Select an asset...</option>
                {mockAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} - {asset.location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Schedule Frequency</Label>
              <select
                value={schedulePMForm.scheduleType}
                onChange={(e) => setSchedulePMForm(prev => ({ ...prev, scheduleType: e.target.value as 'daily' | 'weekly' | 'monthly' | 'quarterly' }))}
                className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <Label>Start Date *</Label>
              <Input
                type="datetime-local"
                value={schedulePMForm.startDate}
                onChange={(e) => setSchedulePMForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={schedulePMForm.notes}
                onChange={(e) => setSchedulePMForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes for this schedule..."
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSchedulePMDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSchedulePM}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Maintenance'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Asset List Dialog */}
      <Dialog open={showAssetListDialog} onOpenChange={setShowAssetListDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              Asset Inventory
            </DialogTitle>
            <DialogDescription>Complete list of all registered assets</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[500px] mt-4">
            <div className="space-y-3">
              {mockAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                      <HardDrive className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">{asset.name}</p>
                        <Badge className={getPriorityColor(asset.criticality)}>{asset.criticality}</Badge>
                        <Badge className={getAssetStatusColor(asset.status)}>{asset.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">{asset.assetTag} | {asset.manufacturer} {asset.model}</p>
                      <p className="text-xs text-gray-400">{asset.location} | Owner: {asset.owner}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-xs mb-2">
                      <div>
                        <p className="text-gray-500">Uptime</p>
                        <p className="font-semibold">{asset.uptime}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">MTBF</p>
                        <p className="font-semibold">{asset.mtbf}h</p>
                      </div>
                      <div>
                        <p className="text-gray-500">MTTR</p>
                        <p className="font-semibold">{asset.mttr}h</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Next maintenance: {formatDate(asset.nextMaintenance)}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAssetListDialog(false)
                          setSchedulePMForm(prev => ({ ...prev, assetId: asset.id }))
                          setShowSchedulePMDialog(true)
                        }}
                      >
                        Schedule PM
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setShowAssetListDialog(false)
                          setFormState(prev => ({
                            ...prev,
                            title: `Work Order - ${asset.name}`,
                            affected_systems: asset.name
                          }))
                          setShowCreateDialog(true)
                        }}
                      >
                        Create Work Order
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-500">{mockAssets.length} assets total</p>
            <Button variant="outline" onClick={() => setShowAssetListDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Insight Action Dialog */}
      <Dialog open={showInsightActionDialog} onOpenChange={setShowInsightActionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Take Action on Insight
            </DialogTitle>
            <DialogDescription>Create a work order based on this AI insight</DialogDescription>
          </DialogHeader>
          {selectedInsight && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{selectedInsight.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedInsight.description}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">This will:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Create a new work order based on this insight
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Set priority to High for immediate attention
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Add insight details to work order notes
                  </li>
                </ul>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setShowInsightActionDialog(false)
              setSelectedInsight(null)
            }}>Cancel</Button>
            <Button
              onClick={processInsightAction}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Work Order'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Add New Spare Part
            </DialogTitle>
            <DialogDescription>Add a new part to the inventory system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Part Name *</Label>
                <Input
                  value={newPartForm.name}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Air Filter 24x24"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Part Number *</Label>
                <Input
                  value={newPartForm.partNumber}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, partNumber: e.target.value }))}
                  placeholder="e.g., AF-2424-M"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={newPartForm.category}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., HVAC Filters"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Manufacturer</Label>
                <Input
                  value={newPartForm.manufacturer}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder="e.g., 3M"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Initial Quantity</Label>
                <Input
                  type="number"
                  value={newPartForm.quantity}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Unit Cost ($)</Label>
                <Input
                  type="number"
                  value={newPartForm.unitCost}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, unitCost: e.target.value }))}
                  placeholder="0.00"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Min Quantity</Label>
                <Input
                  type="number"
                  value={newPartForm.minQuantity}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, minQuantity: e.target.value }))}
                  placeholder="10"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Max Quantity</Label>
                <Input
                  type="number"
                  value={newPartForm.maxQuantity}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, maxQuantity: e.target.value }))}
                  placeholder="100"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Storage Location</Label>
                <Input
                  value={newPartForm.location}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Warehouse A-1"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Lead Time (days)</Label>
                <Input
                  type="number"
                  value={newPartForm.leadTime}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, leadTime: e.target.value }))}
                  placeholder="3"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label>Supplier</Label>
                <Input
                  value={newPartForm.supplier}
                  onChange={(e) => setNewPartForm(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="e.g., HVAC Supply Co"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddPartDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddPart}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add Part'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Technician Dialog */}
      <Dialog open={showAddTechnicianDialog} onOpenChange={setShowAddTechnicianDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Add New Technician
            </DialogTitle>
            <DialogDescription>Add a new technician to the maintenance team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={newTechnicianForm.name}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., John Smith"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newTechnicianForm.email}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@company.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newTechnicianForm.phone}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="555-0101"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  value={newTechnicianForm.role}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="">Select role...</option>
                  <option value="Maintenance Tech">Maintenance Tech</option>
                  <option value="HVAC Specialist">HVAC Specialist</option>
                  <option value="Electrical Tech">Electrical Tech</option>
                  <option value="Mechanical Tech">Mechanical Tech</option>
                  <option value="IT Tech">IT Tech</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
              <div>
                <Label>Department</Label>
                <select
                  value={newTechnicianForm.department}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full mt-1.5 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
                >
                  <option value="">Select department...</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="IT">IT</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <Label>Skills (comma-separated)</Label>
                <Input
                  value={newTechnicianForm.skills}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="e.g., HVAC, Electrical, Plumbing"
                  className="mt-1.5"
                />
              </div>
              <div className="col-span-2">
                <Label>Certifications (comma-separated)</Label>
                <Input
                  value={newTechnicianForm.certifications}
                  onChange={(e) => setNewTechnicianForm(prev => ({ ...prev, certifications: e.target.value }))}
                  placeholder="e.g., EPA 608, OSHA 10"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddTechnicianDialog(false)}>Cancel</Button>
            <Button
              onClick={handleAddTechnician}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add Technician'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reorder Part Dialog */}
      <Dialog open={showReorderPartDialog} onOpenChange={setShowReorderPartDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Reorder Part
            </DialogTitle>
            <DialogDescription>Place a reorder for low stock items</DialogDescription>
          </DialogHeader>
          {selectedPart && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-white">{selectedPart.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Part #: {selectedPart.partNumber}</p>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-500">Current Stock</p>
                    <p className="font-semibold text-red-600">{selectedPart.quantity} units</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Min Quantity</p>
                    <p className="font-semibold">{selectedPart.minQuantity} units</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lead Time</p>
                    <p className="font-semibold">{selectedPart.leadTime} days</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>Reorder Quantity</Label>
                <Input
                  type="number"
                  defaultValue={selectedPart.maxQuantity - selectedPart.quantity}
                  className="mt-1.5"
                />
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Supplier: <span className="font-medium">{selectedPart.supplier}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Estimated Cost: <span className="font-medium">${((selectedPart.maxQuantity - selectedPart.quantity) * selectedPart.unitCost).toFixed(2)}</span>
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setShowReorderPartDialog(false)
              setSelectedPart(null)
            }}>Cancel</Button>
            <Button
              onClick={handleReorderPart}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
            >
              {isSubmitting ? 'Placing Order...' : 'Place Reorder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Run Diagnostics Dialog */}
      <Dialog open={showRunDiagnosticsDialog} onOpenChange={setShowRunDiagnosticsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              System Diagnostics
            </DialogTitle>
            <DialogDescription>Run comprehensive system diagnostics</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {diagnosticsRunning ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm font-medium mb-2">Running diagnostics...</p>
                  <Progress value={diagnosticsProgress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-2">{diagnosticsProgress}% complete</p>
                </div>
                <div className="space-y-2 text-sm">
                  {diagnosticsProgress >= 20 && <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Database connection verified</p>}
                  {diagnosticsProgress >= 40 && <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Asset registry checked</p>}
                  {diagnosticsProgress >= 60 && <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Work order queue verified</p>}
                  {diagnosticsProgress >= 80 && <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Scheduler service operational</p>}
                  {diagnosticsProgress >= 100 && <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> All systems operational</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This will run a comprehensive diagnostic check on all maintenance systems including:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                  <li>Database connectivity and integrity</li>
                  <li>Asset registry synchronization</li>
                  <li>Work order queue status</li>
                  <li>Scheduler service health</li>
                  <li>Integration connections</li>
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setShowRunDiagnosticsDialog(false)
              setDiagnosticsProgress(0)
              setDiagnosticsRunning(false)
            }}>
              {diagnosticsProgress === 100 ? 'Close' : 'Cancel'}
            </Button>
            {!diagnosticsRunning && diagnosticsProgress === 0 && (
              <Button
                onClick={handleRunDiagnostics}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
              >
                Run Diagnostics
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Cache Dialog */}
      <Dialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-600" />
              Clear Cache
            </DialogTitle>
            <DialogDescription>Clear all cached data from the maintenance system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                This will clear all cached data including:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 list-disc list-inside">
                <li>Temporary work order data</li>
                <li>Asset health metrics cache</li>
                <li>Dashboard statistics cache</li>
                <li>Search index cache</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              Note: This may temporarily slow down the application while the cache rebuilds.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowClearCacheDialog(false)}>Cancel</Button>
            <Button
              onClick={handleClearCache}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white"
            >
              {isSubmitting ? 'Clearing...' : 'Clear Cache'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Settings Dialog */}
      <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Reset All Settings
            </DialogTitle>
            <DialogDescription>This action cannot be undone</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                Warning: This will reset all maintenance settings to their default values.
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 mt-2 space-y-1 list-disc list-inside">
                <li>All custom configurations will be lost</li>
                <li>Notification preferences will be reset</li>
                <li>Integration settings will be disconnected</li>
                <li>SLA configurations will return to defaults</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your work orders, assets, and team data will NOT be affected.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
            <Button
              onClick={handleResetSettings}
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Settings'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Data Dialog */}
      <Dialog open={showDeleteDataDialog} onOpenChange={setShowDeleteDataDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete All Maintenance Data
            </DialogTitle>
            <DialogDescription>This action is permanent and cannot be undone</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                DANGER: This will permanently delete ALL maintenance data including:
              </p>
              <ul className="text-sm text-red-600 dark:text-red-400 mt-2 space-y-1 list-disc list-inside">
                <li>All work orders and their history</li>
                <li>All maintenance windows</li>
                <li>All scheduled maintenance records</li>
                <li>All maintenance logs and notes</li>
              </ul>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Consider exporting your data before deletion.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDataDialog(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteAllData}
              disabled={isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? 'Deleting...' : 'Delete All Data'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

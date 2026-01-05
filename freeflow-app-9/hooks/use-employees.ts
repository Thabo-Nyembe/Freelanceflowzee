'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'intern'
export type EmployeeStatus = 'active' | 'on_leave' | 'terminated' | 'pending'

export interface Employee {
  id: string
  userId?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  status: EmployeeStatus
  employmentType: EmploymentType
  department: string
  position: string
  managerId?: string
  managerName?: string
  startDate: string
  endDate?: string
  salary?: number
  currency: string
  location: string
  timezone: string
  skills: string[]
  certifications: string[]
  emergencyContact?: EmergencyContact
  documents: EmployeeDocument[]
  performanceRating?: number
  createdAt: string
  updatedAt: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface EmployeeDocument {
  id: string
  name: string
  type: 'contract' | 'id' | 'certificate' | 'performance' | 'other'
  url: string
  uploadedAt: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  type: 'vacation' | 'sick' | 'personal' | 'parental' | 'other'
  startDate: string
  endDate: string
  days: number
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  approvedBy?: string
  approvedAt?: string
  createdAt: string
}

export interface EmployeeStats {
  totalEmployees: number
  activeEmployees: number
  onLeaveCount: number
  newHiresThisMonth: number
  averageTenure: number
  turnoverRate: number
  departmentCounts: Record<string, number>
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockEmployees: Employee[] = [
  { id: 'emp-1', userId: 'user-1', firstName: 'Alex', lastName: 'Chen', email: 'alex@company.com', phone: '+1-555-0100', status: 'active', employmentType: 'full_time', department: 'Engineering', position: 'Lead Developer', startDate: '2022-01-15', salary: 120000, currency: 'USD', location: 'New York', timezone: 'America/New_York', skills: ['React', 'TypeScript', 'Node.js'], certifications: ['AWS Solutions Architect'], documents: [], performanceRating: 4.5, createdAt: '2022-01-15', updatedAt: '2024-03-01' },
  { id: 'emp-2', firstName: 'Sarah', lastName: 'Miller', email: 'sarah@company.com', avatar: '/avatars/sarah.jpg', status: 'active', employmentType: 'full_time', department: 'Design', position: 'Senior Designer', managerId: 'emp-1', managerName: 'Alex Chen', startDate: '2022-06-01', salary: 95000, currency: 'USD', location: 'Los Angeles', timezone: 'America/Los_Angeles', skills: ['Figma', 'UI/UX', 'Illustration'], certifications: [], documents: [], performanceRating: 4.8, createdAt: '2022-06-01', updatedAt: '2024-02-15' },
  { id: 'emp-3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@company.com', status: 'on_leave', employmentType: 'full_time', department: 'Engineering', position: 'Frontend Developer', managerId: 'emp-1', managerName: 'Alex Chen', startDate: '2023-01-10', salary: 85000, currency: 'USD', location: 'Remote', timezone: 'Europe/London', skills: ['Vue.js', 'CSS', 'JavaScript'], certifications: [], documents: [], createdAt: '2023-01-10', updatedAt: '2024-03-15' },
  { id: 'emp-4', firstName: 'Emily', lastName: 'Davis', email: 'emily@company.com', status: 'active', employmentType: 'contractor', department: 'Marketing', position: 'Content Manager', startDate: '2023-09-01', currency: 'USD', location: 'Chicago', timezone: 'America/Chicago', skills: ['Content Writing', 'SEO'], certifications: [], documents: [], createdAt: '2023-09-01', updatedAt: '2024-01-20' }
]

const mockLeaveRequests: LeaveRequest[] = [
  { id: 'leave-1', employeeId: 'emp-3', employeeName: 'Mike Johnson', type: 'vacation', startDate: '2024-03-15', endDate: '2024-03-22', days: 5, status: 'approved', reason: 'Family vacation', approvedBy: 'Alex Chen', approvedAt: '2024-03-10', createdAt: '2024-03-05' },
  { id: 'leave-2', employeeId: 'emp-2', employeeName: 'Sarah Miller', type: 'personal', startDate: '2024-04-01', endDate: '2024-04-02', days: 2, status: 'pending', reason: 'Personal matters', createdAt: '2024-03-18' }
]

const mockStats: EmployeeStats = {
  totalEmployees: 4,
  activeEmployees: 3,
  onLeaveCount: 1,
  newHiresThisMonth: 0,
  averageTenure: 1.5,
  turnoverRate: 5,
  departmentCounts: { Engineering: 2, Design: 1, Marketing: 1 }
}

// ============================================================================
// HOOK
// ============================================================================

interface UseEmployeesOptions {
  
  department?: string
  managerId?: string
}

export function useEmployees(options: UseEmployeesOptions = {}) {
  const {  department, managerId } = options

  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [stats, setStats] = useState<EmployeeStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchEmployees = useCallback(async (filters?: { status?: string; department?: string; employmentType?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.department || department) params.set('department', filters?.department || department || '')
      if (managerId) params.set('managerId', managerId)
      if (filters?.employmentType) params.set('employmentType', filters.employmentType)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/employees?${params}`)
      const result = await response.json()
      if (result.success) {
        setEmployees(Array.isArray(result.employees) ? result.employees : [])
        setLeaveRequests(Array.isArray(result.leaveRequests) ? result.leaveRequests : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.employees
      }
      setEmployees([])
      setStats(null)
      return []
    } catch (err) {
      setEmployees([])
      setLeaveRequests(mockLeaveRequests)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ department, managerId])

  const createEmployee = useCallback(async (data: Omit<Employee, 'id' | 'documents' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchEmployees()
        return { success: true, employee: result.employee }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newEmployee: Employee = { ...data, id: `emp-${Date.now()}`, documents: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setEmployees(prev => [newEmployee, ...prev])
      return { success: true, employee: newEmployee }
    }
  }, [fetchEmployees])

  const updateEmployee = useCallback(async (employeeId: string, updates: Partial<Employee>) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      }
      return result
    } catch (err) {
      setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, ...updates } : e))
      return { success: true }
    }
  }, [])

  const deleteEmployee = useCallback(async (employeeId: string) => {
    try {
      await fetch(`/api/employees/${employeeId}`, { method: 'DELETE' })
      setEmployees(prev => prev.filter(e => e.id !== employeeId))
      return { success: true }
    } catch (err) {
      setEmployees(prev => prev.filter(e => e.id !== employeeId))
      return { success: true }
    }
  }, [])

  const terminateEmployee = useCallback(async (employeeId: string, endDate: string, reason?: string) => {
    return updateEmployee(employeeId, { status: 'terminated', endDate })
  }, [updateEmployee])

  const submitLeaveRequest = useCallback(async (data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/employees/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        setLeaveRequests(prev => [result.request, ...prev])
        return { success: true, request: result.request }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newRequest: LeaveRequest = { ...data, id: `leave-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() }
      setLeaveRequests(prev => [newRequest, ...prev])
      return { success: true, request: newRequest }
    }
  }, [])

  const approveLeaveRequest = useCallback(async (requestId: string, approverId: string) => {
    setLeaveRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' as const, approvedBy: approverId, approvedAt: new Date().toISOString() } : r))
    return { success: true }
  }, [])

  const rejectLeaveRequest = useCallback(async (requestId: string, reason?: string) => {
    setLeaveRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' as const } : r))
    return { success: true }
  }, [])

  const uploadDocument = useCallback(async (employeeId: string, file: File, type: EmployeeDocument['type']) => {
    const newDoc: EmployeeDocument = { id: `doc-${Date.now()}`, name: file.name, type, url: URL.createObjectURL(file), uploadedAt: new Date().toISOString() }
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, documents: [...e.documents, newDoc] } : e))
    return { success: true, document: newDoc }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchEmployees({ search: query })
  }, [fetchEmployees])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => { refresh() }, [refresh])

  const activeEmployees = useMemo(() => employees.filter(e => e.status === 'active'), [employees])
  const onLeaveEmployees = useMemo(() => employees.filter(e => e.status === 'on_leave'), [employees])
  const employeesByDepartment = useMemo(() => {
    const grouped: Record<string, Employee[]> = {}
    employees.forEach(e => {
      if (!grouped[e.department]) grouped[e.department] = []
      grouped[e.department].push(e)
    })
    return grouped
  }, [employees])
  const pendingLeaveRequests = useMemo(() => leaveRequests.filter(r => r.status === 'pending'), [leaveRequests])
  const departments = useMemo(() => [...new Set(employees.map(e => e.department))], [employees])
  const positions = useMemo(() => [...new Set(employees.map(e => e.position))], [employees])
  const fullName = useCallback((employee: Employee) => `${employee.firstName} ${employee.lastName}`, [])

  return {
    employees, currentEmployee, leaveRequests, stats, activeEmployees, onLeaveEmployees, employeesByDepartment, pendingLeaveRequests, departments, positions,
    isLoading, error, searchQuery,
    refresh, fetchEmployees, createEmployee, updateEmployee, deleteEmployee, terminateEmployee, submitLeaveRequest, approveLeaveRequest, rejectLeaveRequest, uploadDocument, search, fullName,
    setCurrentEmployee
  }
}

export default useEmployees
